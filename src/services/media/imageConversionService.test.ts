import {
  convertImageForUpload,
  prepareProfileImageForUpload,
} from './imageConversionService';

describe('image upload format validation', () => {
  test.each([
    ['image/jpeg', 'file:///photo.jpg', 'image/jpeg'],
    ['image/png', 'file:///photo.png', 'image/png'],
    [undefined, 'file:///photo.png', 'image/png'],
  ])('keeps supported image bytes unchanged (%s)', async (mimeType, uri, expectedType) => {
    await expect(convertImageForUpload(uri, mimeType)).resolves.toEqual({
      uri,
      mimeType: expectedType,
    });
  });

  test('rejects unsupported formats instead of trying to convert them', async () => {
    await expect(convertImageForUpload('file:///photo.heic', 'image/heic'))
      .rejects.toThrow('Chỉ hỗ trợ ảnh JPG hoặc PNG');
  });

  test('preserves the selected profile image and validates its supported type', async () => {
    await expect(prepareProfileImageForUpload('file:///avatar.png', 'image/jpeg'))
      .resolves.toEqual({ uri: 'file:///avatar.png', mimeType: 'image/png' });
  });
});
