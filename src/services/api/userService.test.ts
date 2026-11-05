import { ApiClientError } from './apiClient';
import { getPublicUser } from './userService';

const mockJsonResponse = (body: unknown, status = 200): Response => ({
  ok: status >= 200 && status < 300,
  status,
  text: async () => JSON.stringify(body),
}) as Response;

describe('userService', () => {
  beforeEach(() => jest.restoreAllMocks());

  test('loads a public profile using an encoded user ID', async () => {
    const profile = { id: 'user-001', fullName: 'Nguyen Minh Anh', avatarUrl: '' };
    const fetch = jest.spyOn(globalThis, 'fetch').mockResolvedValue(mockJsonResponse(profile));

    await expect(getPublicUser('student 001')).resolves.toEqual(profile);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/users\/student%20001\/public$/),
      expect.objectContaining({ headers: expect.objectContaining({ Accept: 'application/json' }) }),
    );
  });

  test('maps missing profiles and rejects empty IDs', async () => {
    jest.spyOn(globalThis, 'fetch').mockResolvedValue(mockJsonResponse({
      error: { code: 'NOT_FOUND', message: 'User was not found.' },
    }, 404));

    await expect(getPublicUser('user-missing')).rejects.toMatchObject({
      name: 'ApiClientError',
      code: 'NOT_FOUND',
    } satisfies Partial<ApiClientError>);
    await expect(getPublicUser(' ')).rejects.toThrow('Mã người dùng là bắt buộc.');
  });
});
