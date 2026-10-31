export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

const API_BASE_URL = (
  process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001'
).replace(/\/+$/, '');

export async function apiRequest<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        Accept: 'application/json',
        ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
        ...init?.headers,
      },
    });
  } catch (error) {
    const detail = error instanceof Error ? ` ${error.message}` : '';
    throw new ApiClientError(
      `Không thể kết nối JSON Server tại ${API_BASE_URL}.${detail}`,
      'NETWORK_ERROR',
      0,
    );
  }

  const responseText = await response.text();
  let result: unknown;
  if (responseText) {
    try {
      result = JSON.parse(responseText) as unknown;
    } catch {
      throw new ApiClientError(
        'JSON Server trả về dữ liệu không hợp lệ.',
        'INVALID_RESPONSE',
        response.status,
      );
    }
  }

  if (!response.ok) {
    const errorResult = result as
      | { error?: { code?: string; message?: string }; message?: string }
      | undefined;
    throw new ApiClientError(
      errorResult?.error?.message
        ?? errorResult?.message
        ?? `Yêu cầu API thất bại với mã ${response.status}.`,
      errorResult?.error?.code ?? 'HTTP_ERROR',
      response.status,
    );
  }

  return result as T;
}

export function encodeQueryValue(value: string): string {
  return encodeURIComponent(value);
}
