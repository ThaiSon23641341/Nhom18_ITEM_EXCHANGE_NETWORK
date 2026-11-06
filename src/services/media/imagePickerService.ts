import * as ImagePicker from 'expo-image-picker';

export interface PickedImage {
  uri: string;
  mimeType?: string;
}

const PICKER_OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: ['images'],
  allowsEditing: true,
  quality: 0.7,
};

const toPickedImage = (result: ImagePicker.ImagePickerResult): PickedImage | null => {
  if (result.canceled || result.assets.length === 0) return null;
  const [asset] = result.assets;
  return { uri: asset.uri, mimeType: asset.mimeType };
};

// Returns null when the user cancels; throws a readable error when permission is denied.
export async function pickImageFromLibrary(): Promise<PickedImage | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    throw new Error('Cần cho phép truy cập thư viện ảnh để chọn ảnh.');
  }
  return toPickedImage(await ImagePicker.launchImageLibraryAsync(PICKER_OPTIONS));
}

export async function takePhoto(): Promise<PickedImage | null> {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    throw new Error('Cần cho phép truy cập máy ảnh để chụp ảnh.');
  }
  return toPickedImage(await ImagePicker.launchCameraAsync(PICKER_OPTIONS));
}
