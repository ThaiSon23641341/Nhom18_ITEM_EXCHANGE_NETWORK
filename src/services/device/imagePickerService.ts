import * as ImagePicker from 'expo-image-picker';

export interface DeviceImage {
  uri: string;
  width?: number;
  height?: number;
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
    allowsEditing: limit === 1,
    ...(limit === 1 ? { aspect: [4, 3] as [number, number] } : {}),
    quality: 0.85,
  });

  if (result.canceled || result.assets.length === 0) return [];
  return result.assets.map(({ uri, width, height }) => ({ uri, width, height }));
}
