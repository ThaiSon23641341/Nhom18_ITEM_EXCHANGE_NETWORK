import * as ImagePicker from 'expo-image-picker';
import { convertImageForUpload } from '../media/imageConversionService';

export interface DeviceImage {
  uri: string;
  width?: number;
  height?: number;
  mimeType?: string;
}

export async function pickImagesFromLibrary(limit: number): Promise<DeviceImage[]> {
  if (!Number.isInteger(limit) || limit < 1) {
    throw new Error('Số lượng ảnh cần chọn phải là số nguyên dương.');
  }

  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    throw new Error('Bạn cần cấp quyền truy cập thư viện ảnh để chọn ảnh.');
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsMultipleSelection: limit > 1,
    selectionLimit: limit,
    allowsEditing: false,
    quality: 0.85,
  });

  if (result.canceled || result.assets.length === 0) return [];
  const images: DeviceImage[] = [];
  for (const asset of result.assets) {
    const convertedImage = await convertImageForUpload(asset.uri, asset.mimeType);
    images.push({
      ...convertedImage,
      width: asset.width,
      height: asset.height,
    });
  }
  return images;
}
