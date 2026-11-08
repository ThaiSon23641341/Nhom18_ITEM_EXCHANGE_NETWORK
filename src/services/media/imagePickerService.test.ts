import * as ImagePicker from 'expo-image-picker';
import { convertImageForUpload } from './imageConversionService';
import { pickImageFromLibrary, takePhoto } from './imagePickerService';

jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(),
  requestCameraPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
}));

jest.mock('./imageConversionService', () => ({
  convertImageForUpload: jest.fn(async (uri: string, mimeType?: string) => (
    mimeType === 'image/heic'
      ? { uri: 'file:///cache/photo.jpg', mimeType: 'image/jpeg' }
      : { uri, mimeType: mimeType ?? 'image/jpeg' }
  )),
}));

const picker = ImagePicker as jest.Mocked<typeof ImagePicker>;

describe('imagePickerService', () => {
  beforeEach(() => jest.clearAllMocks());

  test('returns the picked asset from the library', async () => {
    picker.requestMediaLibraryPermissionsAsync.mockResolvedValue({ granted: true } as never);
    picker.launchImageLibraryAsync.mockResolvedValue({
      canceled: false,
      assets: [{
        uri: 'file:///a.jpg',
        mimeType: 'image/jpeg',
        fileName: 'a.jpg',
      }],
    } as never);
    const pickedImage = await pickImageFromLibrary();
    expect(pickedImage).toMatchObject({
      uri: 'file:///a.jpg',
      mimeType: 'image/jpeg',
      fileName: 'a.jpg',
      asset: { uri: 'file:///a.jpg', fileName: 'a.jpg', mimeType: 'image/jpeg' },
    });
    expect(picker.launchImageLibraryAsync).toHaveBeenCalledWith(
      expect.objectContaining({ allowsEditing: false }),
    );
  });

  test('returns null when the user cancels', async () => {
    picker.requestCameraPermissionsAsync.mockResolvedValue({ granted: true } as never);
    picker.launchCameraAsync.mockResolvedValue({ canceled: true, assets: null } as never);
    await expect(takePhoto()).resolves.toBeNull();
    expect(picker.launchCameraAsync).toHaveBeenCalledWith(
      expect.objectContaining({ allowsEditing: false }),
    );
  });

  test('normalizes gallery images outside JPEG/PNG before returning them', async () => {
    picker.requestMediaLibraryPermissionsAsync.mockResolvedValue({ granted: true } as never);
    picker.launchImageLibraryAsync.mockResolvedValue({
      canceled: false,
      assets: [{
        uri: 'file:///photo.heic',
        mimeType: 'image/heic',
        fileName: 'photo.heic',
      }],
    } as never);

    await expect(pickImageFromLibrary()).resolves.toMatchObject({
      uri: 'file:///cache/photo.jpg',
      mimeType: 'image/jpeg',
      fileName: 'photo.heic',
      asset: { uri: 'file:///photo.heic', mimeType: 'image/heic' },
    });
    expect(convertImageForUpload).toHaveBeenCalledWith('file:///photo.heic', 'image/heic');
  });

  test('explains denied permissions without opening the picker', async () => {
    picker.requestMediaLibraryPermissionsAsync.mockResolvedValue({ granted: false } as never);
    picker.requestCameraPermissionsAsync.mockResolvedValue({ granted: false } as never);
    await expect(pickImageFromLibrary()).rejects.toThrow('thư viện ảnh');
    await expect(takePhoto()).rejects.toThrow('máy ảnh');
    expect(picker.launchImageLibraryAsync).not.toHaveBeenCalled();
    expect(picker.launchCameraAsync).not.toHaveBeenCalled();
  });
});
