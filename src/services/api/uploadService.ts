import { ApiClientError, API_BASE_URL, apiRequest } from './apiClient';

const SUPPORTED_TYPES = ['image/jpeg', 'image/png'];

export function resolveMediaUrl(url: string): string {
  return url.startsWith('/uploads/') ? `${API_BASE_URL}${url}` : url;
}

function normalizeMimeType(mimeType: string | undefined, uri: string): string {
  const declared = mimeType === 'image/jpg' ? 'image/jpeg' : mimeType;
  if (declared && SUPPORTED_TYPES.includes(declared)) return declared;
  return /\.png(?:\?|$)/i.test(uri) ? 'image/png' : 'image/jpeg';
}

// Uploads one local image and returns the server path to store on a record.
export async function uploadImage(uri: string, mimeType?: string): Promise<string> {
  if (!uri.trim()) {
    throw new ApiClientError('Chưa chọn ảnh để tải lên.', 'BAD_REQUEST', 400);
  }
  const type = normalizeMimeType(mimeType, uri);
  const blob = await (await fetch(uri)).blob();
  const { url } = await apiRequest<{ url: string }>('/uploads', {
    method: 'POST',
    headers: { 'Content-Type': type },
    body: blob,
  });
  return url;
}
