import { ApiClientError, API_BASE_URL, apiRequest } from './apiClient';
import { prepareProfileImageForUpload } from '../media/imageConversionService';
import { Platform } from 'react-native';
import { File as ExpoFile } from 'expo-file-system';

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export interface UploadImageFile {
  uri: string;
  name: string;
  type: string;
}

export function resolveMediaUrl(url: string): string {
  return url.startsWith('/uploads/') ? `${API_BASE_URL}${url}` : url;
}

// Uploads one prepared image using multipart on native to avoid reading file:// through Blob.
export async function uploadImage(file: UploadImageFile): Promise<string> {
  if (!file.uri.trim()) {
    throw new ApiClientError('Chưa chọn ảnh để tải lên.', 'BAD_REQUEST', 400);
  }
  const preparedImage = await prepareProfileImageForUpload(file.uri, file.type);
  const formData = new FormData();

  if (Platform.OS === 'web') {
    const blob = await (await fetch(preparedImage.uri)).blob();
    if (blob.size > MAX_UPLOAD_BYTES) {
      throw new ApiClientError(
        'Ảnh vẫn vượt quá 5 MB sau khi xử lý. Vui lòng chọn ảnh khác.',
        'PAYLOAD_TOO_LARGE',
        413,
      );
    }
    formData.append('file', new Blob([blob], { type: preparedImage.mimeType }), file.name);
  } else {
    const nativeFile = new ExpoFile(preparedImage.uri);
    if (nativeFile.size > MAX_UPLOAD_BYTES) {
      throw new ApiClientError(
        'Ảnh vượt quá 5 MB. Vui lòng chọn ảnh nhỏ hơn.',
        'PAYLOAD_TOO_LARGE',
        413,
      );
    }
    formData.append('file', nativeFile, file.name);
  }
  const { url } = await apiRequest<{ url: string }>('/uploads', {
    method: 'POST',
    body: formData,
  });
  return url;
}
