import { uploadImage, resolveMediaUrl } from './uploadService';

jest.mock('./tokenStorage', () => ({ getAuthToken: () => 'tok' }));
jest.mock('expo-file-system', () => ({
  File: class MockExpoFile extends Blob {
    constructor(uri: string) {
      super(['image bytes'], { type: 'image/jpeg' });
      Object.defineProperty(this, 'uri', { value: uri });
    }
  },
}));
jest.mock('../media/imageConversionService', () => ({
  prepareProfileImageForUpload: jest.fn(async (uri: string) => ({
    uri,
    mimeType: 'image/jpeg',
  })),
}));

describe('uploadService', () => {
  beforeEach(() => jest.restoreAllMocks());

  test('posts native file data as FormData without loading it through Blob', async () => {
    const fetch = jest.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 201,
      text: async () => JSON.stringify({ url: '/uploads/abc.jpg' }),
    } as Response);

    await expect(uploadImage({
      uri: 'file:///photo.tmp',
      name: 'avatar_123.jpg',
      type: 'image/jpeg',
    })).resolves.toBe('/uploads/abc.jpg');
    const [url, init] = fetch.mock.calls[0];
    expect(String(url)).toMatch(/\/uploads$/);
    expect(init?.method).toBe('POST');
    expect(init?.body).toBeInstanceOf(FormData);
    const uploadedPart = (init?.body as FormData).get('file') as File;
    expect(uploadedPart).toBeInstanceOf(Blob);
    expect(uploadedPart.name).toBe('avatar_123.jpg');
    expect(uploadedPart.type).toBe('image/jpeg');
    const requestHeaders = new Headers(init?.headers);
    expect(requestHeaders.has('content-type')).toBe(false);
    expect(requestHeaders.get('authorization')).toBe('Bearer tok');
  });

  test('uses the blob MIME type for picker URIs without an extension', async () => {
    const blob = { type: 'image/png' } as Blob;
    const fetch = jest.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce({ blob: async () => blob } as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 201,
        text: async () => JSON.stringify({ url: '/uploads/x.png' }),
      } as Response);

    await uploadImage('blob:https://app.example/uuid');
    expect(fetch.mock.calls[1][1]?.headers).toMatchObject({ 'Content-Type': 'image/png' });
  });

  test('rejects an empty uri and resolves only upload paths against the server', async () => {
    await expect(uploadImage({ uri: ' ', name: 'avatar.jpg', type: 'image/jpeg' }))
      .rejects.toMatchObject({ status: 400 });
    expect(resolveMediaUrl('/uploads/a.jpg')).toMatch(/^https?:\/\/.+\/uploads\/a\.jpg$/);
    expect(resolveMediaUrl('https://cdn.example/a.jpg')).toBe('https://cdn.example/a.jpg');
  });

});
