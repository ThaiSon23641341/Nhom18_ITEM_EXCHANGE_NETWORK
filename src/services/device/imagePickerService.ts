import * as ImagePicker from 'expo-image-picker';

export interface DeviceImage {
  uri: string;
  width?: number;
  height?: number;
}

export async function pickImageFromLibrary(): Promise<DeviceImage | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    throw new Error('Bạn cần cấp quyền truy cập thư viện ảnh để chọn ảnh.');
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.85,
  });

  if (result.canceled || result.assets.length === 0) {
    return null;
  }

  const [asset] = result.assets;
  return { uri: asset.uri, width: asset.width, height: asset.height };
}
