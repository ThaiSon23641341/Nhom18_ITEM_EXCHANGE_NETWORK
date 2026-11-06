import { uploadImage, resolveMediaUrl } from './uploadService';

jest.mock('./tokenStorage', () => ({ getAuthToken: () => 'tok' }));

describe('uploadService', () => {
  beforeEach(() => jest.restoreAllMocks());

  test('posts the image bytes with the image content type and returns the server path', async () => {
    const blob = { type: '' } as Blob;
    const fetch = jest.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce({ blob: async () => blob } as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 201,
        text: async () => JSON.stringify({ url: '/uploads/abc.jpg' }),
      } as Response);

    await expect(uploadImage('file:///photo.png', 'image/jpg')).resolves.toBe('/uploads/abc.jpg');
    const [url, init] = fetch.mock.calls[1];
    expect(String(url)).toMatch(/\/uploads$/);
    expect(init?.method).toBe('POST');
    expect(init?.body).toBe(blob);
    expect(init?.headers).toMatchObject({ 'Content-Type': 'image/jpeg', Authorization: 'Bearer tok' });
  });

  test('falls back to the file extension when the picker gives no type', async () => {
    const fetch = jest.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce({ blob: async () => ({}) as Blob } as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 201,
        text: async () => JSON.stringify({ url: '/uploads/x.png' }),
      } as Response);
    await uploadImage('file:///photo.png');
    expect(fetch.mock.calls[1][1]?.headers).toMatchObject({ 'Content-Type': 'image/png' });
  });

  test('rejects an empty uri and resolves only upload paths against the server', async () => {
    await expect(uploadImage(' ')).rejects.toMatchObject({ status: 400 });
    expect(resolveMediaUrl('/uploads/a.jpg')).toMatch(/^https?:\/\/.+\/uploads\/a\.jpg$/);
    expect(resolveMediaUrl('https://cdn.example/a.jpg')).toBe('https://cdn.example/a.jpg');
  });
});
