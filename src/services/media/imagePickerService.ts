import * as ImagePicker from 'expo-image-picker';
import { convertImageForUpload } from './imageConversionService';

export interface PickedImage {
  uri: string;
  mimeType?: string;
  fileName?: string | null;
  asset: ImagePicker.ImagePickerAsset;
}

const PICKER_OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: ['images'],
  // Avoid the native crop screen where its confirmation action can be inaccessible on some Android devices.
  allowsEditing: false,
  quality: 0.7,
};

const toPickedImage = async (
  result: ImagePicker.ImagePickerResult,
): Promise<PickedImage | null> => {
  if (result.canceled || result.assets.length === 0) return null;
  const [asset] = result.assets;
  const convertedImage = await convertImageForUpload(asset.uri, asset.mimeType);
  return {
    ...convertedImage,
    fileName: asset.fileName,
    asset,
  };
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
