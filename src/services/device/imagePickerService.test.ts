import * as ImagePicker from 'expo-image-picker';
import { pickImagesFromLibrary } from './imagePickerService';

jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
}));

jest.mock('../media/imageConversionService', () => ({
  convertImageForUpload: jest.fn(async (uri: string, mimeType?: string) => ({
    uri,
    mimeType: mimeType ?? 'image/jpeg',
  })),
}));

const picker = ImagePicker as jest.Mocked<typeof ImagePicker>;

describe('device imagePickerService', () => {
  beforeEach(() => jest.clearAllMocks());

  test('does not open the native cropper for a single image', async () => {
    picker.requestMediaLibraryPermissionsAsync.mockResolvedValue({ granted: true } as never);
    picker.launchImageLibraryAsync.mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file:///item.jpg', mimeType: 'image/jpeg' }],
    } as never);

    await expect(pickImagesFromLibrary(1)).resolves.toEqual([
      { uri: 'file:///item.jpg', mimeType: 'image/jpeg' },
    ]);
    expect(picker.launchImageLibraryAsync).toHaveBeenCalledWith(
      expect.objectContaining({ allowsEditing: false }),
    );
    expect(picker.launchImageLibraryAsync).not.toHaveBeenCalledWith(
      expect.objectContaining({ aspect: expect.anything() }),
    );
  });
});
