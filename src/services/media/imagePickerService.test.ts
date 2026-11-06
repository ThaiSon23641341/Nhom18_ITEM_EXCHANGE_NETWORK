import * as ImagePicker from 'expo-image-picker';
import { pickImageFromLibrary, takePhoto } from './imagePickerService';

jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(),
  requestCameraPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
}));

const picker = ImagePicker as jest.Mocked<typeof ImagePicker>;

describe('imagePickerService', () => {
  beforeEach(() => jest.clearAllMocks());

  test('returns the picked asset from the library', async () => {
    picker.requestMediaLibraryPermissionsAsync.mockResolvedValue({ granted: true } as never);
    picker.launchImageLibraryAsync.mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file:///a.jpg', mimeType: 'image/jpeg' }],
    } as never);
    await expect(pickImageFromLibrary()).resolves.toEqual({ uri: 'file:///a.jpg', mimeType: 'image/jpeg' });
  });

  test('returns null when the user cancels', async () => {
    picker.requestCameraPermissionsAsync.mockResolvedValue({ granted: true } as never);
    picker.launchCameraAsync.mockResolvedValue({ canceled: true, assets: null } as never);
    await expect(takePhoto()).resolves.toBeNull();
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
