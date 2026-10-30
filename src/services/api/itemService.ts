import type { CreateItemInput, Item, ItemPaginationResponse, UpdateItemInput } from '../../models';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

export class ItemApiError extends Error {
  constructor(message: string, public readonly code: 'BAD_REQUEST' | 'NOT_FOUND' | 'NETWORK') {
    super(message);
    this.name = 'ItemApiError';
  }
}

export const MockApiError = ItemApiError;

const getApiErrorMessage = (payload: unknown): string => {
  if (
    typeof payload === 'object' &&
    payload !== null &&
    'error' in payload &&
    typeof payload.error === 'object' &&
    payload.error !== null &&
    'message' in payload.error &&
    typeof payload.error.message === 'string'
  ) {
    return payload.error.message;
  }
  return 'Không thể kết nối máy chủ. Vui lòng thử lại.';
};

const getApiErrorCode = (payload: unknown): ItemApiError['code'] => {
  if (
    typeof payload === 'object' &&
    payload !== null &&
    'error' in payload &&
    typeof payload.error === 'object' &&
    payload.error !== null &&
    'code' in payload.error
  ) {
    if (payload.error.code === 'NOT_FOUND') return 'NOT_FOUND';
    if (payload.error.code === 'BAD_REQUEST') return 'BAD_REQUEST';
  }
  return 'NETWORK';
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    });
  } catch (error: unknown) {
    console.warn('Không thể kết nối API món đồ:', error);
    throw new ItemApiError(
      'Không thể kết nối máy chủ. Hãy khởi động backend và kiểm tra EXPO_PUBLIC_API_URL.',
      'NETWORK',
    );
  }

  const payload: unknown = response.status === 204 ? undefined : await response.json();
  if (!response.ok) {
    throw new ItemApiError(getApiErrorMessage(payload), getApiErrorCode(payload));
  }
  return payload as T;
}

function isItemResponse(value: unknown): value is { data: Item } {
  return typeof value === 'object' && value !== null && 'data' in value && typeof value.data === 'object' && value.data !== null;
}

function isPaginationResponse(value: unknown): value is ItemPaginationResponse {
  return (
    isItemResponse(value) &&
    Array.isArray(value.data) &&
    'page' in value &&
    'limit' in value &&
    'total' in value &&
    'totalPages' in value &&
    'hasMore' in value
  );
}

export async function getItems(page: number, limit: number): Promise<ItemPaginationResponse> {
  const payload = await request<unknown>(`/items?page=${page}&limit=${limit}`);
  if (!isPaginationResponse(payload)) {
    throw new ItemApiError('Dữ liệu món đồ từ máy chủ không hợp lệ.', 'NETWORK');
  }
  return payload;
}

export async function getItemById(id: string): Promise<Item> {
  const payload = await request<unknown>(`/items/${encodeURIComponent(id)}`);
  if (!isItemResponse(payload)) {
    throw new ItemApiError('Dữ liệu món đồ từ máy chủ không hợp lệ.', 'NETWORK');
  }
  return payload.data;
}

export async function createItem(itemData: CreateItemInput): Promise<Item> {
  const payload = await request<unknown>('/items', {
    method: 'POST',
    body: JSON.stringify(itemData),
  });
  if (!isItemResponse(payload)) {
    throw new ItemApiError('Dữ liệu món đồ từ máy chủ không hợp lệ.', 'NETWORK');
  }
  return payload.data;
}

export async function updateItem(id: string, itemData: UpdateItemInput): Promise<Item> {
  const payload = await request<unknown>(`/items/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(itemData),
  });
  if (!isItemResponse(payload)) {
    throw new ItemApiError('Dữ liệu món đồ từ máy chủ không hợp lệ.', 'NETWORK');
  }
  return payload.data;
}

export async function deleteItem(id: string): Promise<void> {
  await request<void>(`/items/${encodeURIComponent(id)}`, { method: 'DELETE' });
}
