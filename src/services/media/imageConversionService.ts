export interface ConvertedImage {
  uri: string;
  mimeType: string;
}

const getUploadMimeType = (uri: string, mimeType?: string): string => {
  const cleanUri = uri.split(/[?#]/, 1)[0] ?? uri;
  const extension = cleanUri.split('.').pop()?.toLowerCase();
  if (extension === 'png') return 'image/png';
  if (extension === 'jpg' || extension === 'jpeg') return 'image/jpeg';

  const normalizedType = mimeType?.toLowerCase();
  if (normalizedType === 'image/png') return 'image/png';
  if (normalizedType === 'image/jpeg' || normalizedType === 'image/jpg') return 'image/jpeg';

  throw new Error('Chỉ hỗ trợ ảnh JPG hoặc PNG. Vui lòng chọn ảnh ở định dạng này.');
};

// Keep the picked file unchanged; the server validates its actual image signature.
export async function convertImageForUpload(
  uri: string,
  mimeType?: string,
): Promise<ConvertedImage> {
  return { uri, mimeType: getUploadMimeType(uri, mimeType) };
}

// Kept as a separate upload boundary so the service can validate the same formats.
export async function prepareProfileImageForUpload(
  uri: string,
  mimeType?: string,
): Promise<ConvertedImage> {
  return { uri, mimeType: getUploadMimeType(uri, mimeType) };
}
