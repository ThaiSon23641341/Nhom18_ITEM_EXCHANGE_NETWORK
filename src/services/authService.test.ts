import { ApiClientError } from './api/apiClient';
import { clearToken, saveToken } from './api/tokenStorage';
import {
  getPublicUserById,
  isValidPassword,
  registerAccount,
  requestPasswordReset,
  resetPassword,
  signInWithPassword,
  signOut,
} from './authService';

jest.mock('./api/tokenStorage', () => ({
  getAuthToken: () => null,
  saveToken: jest.fn().mockResolvedValue(undefined),
  clearToken: jest.fn().mockResolvedValue(undefined),
}));

const mockJsonResponse = (body: unknown, status = 200): Response =>
  ({
    ok: status >= 200 && status < 300,
    status,
    text: async () => JSON.stringify(body),
  }) as Response;

describe('authService demo identity', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  test('posts credentials to the login endpoint with a normalised email', async () => {
    const user = {
      id: 'user-001',
      email: 'sinhvien001@student.iuh.edu.vn',
      studentId: '21036001',
      fullName: 'Nguyen Minh Anh',
      avatarUrl: '',
      role: 'student' as const,
      createdAt: '2026-10-01T08:00:00.000Z',
      updatedAt: '2026-10-01T08:00:00.000Z',
    };
    const fetch = jest.spyOn(globalThis, 'fetch').mockResolvedValue(mockJsonResponse({ token: 'a'.repeat(64), user }));

    await expect(signInWithPassword(` ${user.email.toUpperCase()} `, 'Demo@1234')).resolves.toEqual(user);
    expect(saveToken).toHaveBeenCalledWith('a'.repeat(64));
    const [url, options] = fetch.mock.calls[0];
    expect(url).toContain('/auth/login');
    expect(JSON.parse(String(options?.body))).toEqual({ email: user.email, password: 'Demo@1234' });
  });

  test('rejects bad input before calling the API', async () => {
    const fetch = jest.spyOn(globalThis, 'fetch');
    await expect(signInWithPassword('abc@gmail.com', 'Demo@1234')).rejects.toMatchObject({ status: 400 });
    await expect(signInWithPassword('21036001.an@student.iuh.edu.vn', '')).rejects.toMatchObject({ status: 400 });
    await expect(registerAccount('21036001.an@student.iuh.edu.vn', 'weak')).rejects.toMatchObject({ status: 400 });
    await expect(requestPasswordReset('an@student.iuh.edu.vn')).rejects.toMatchObject({ status: 400 });
    await expect(resetPassword('21036001.an@student.iuh.edu.vn', '123456', 'weak')).rejects.toMatchObject({ status: 400 });
    expect(fetch).not.toHaveBeenCalled();
  });

  test('surfaces the missing-account code so the app can open registration', async () => {
    jest.spyOn(globalThis, 'fetch').mockResolvedValue(mockJsonResponse(
      { error: { code: 'ACCOUNT_NOT_FOUND', message: 'Tài khoản chưa tồn tại.' } },
      404,
    ));
    await expect(signInWithPassword('21036001.an@student.iuh.edu.vn', 'Demo@1234')).rejects.toMatchObject({
      code: 'ACCOUNT_NOT_FOUND',
      status: 404,
    });
  });

  test('registers and resets passwords through the auth endpoints', async () => {
    const fetch = jest.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(mockJsonResponse({ token: 'b'.repeat(64), user: { id: 'student-21036001' } }, 201))
      .mockResolvedValueOnce(mockJsonResponse({ resetCode: '123456', expiresInSeconds: 600 }))
      .mockResolvedValueOnce(mockJsonResponse({ ok: true }));

    await registerAccount('21036001.an@student.iuh.edu.vn', 'Abcd@1234');
    expect(saveToken).toHaveBeenCalledWith('b'.repeat(64));
    await expect(requestPasswordReset('21036001.an@student.iuh.edu.vn')).resolves.toEqual({
      resetCode: '123456',
      expiresInSeconds: 600,
    });
    await resetPassword('21036001.an@student.iuh.edu.vn', ' 123456 ', 'Moi@12345');

    expect(fetch.mock.calls.map(([url]) => String(url).split('/').slice(-2).join('/'))).toEqual([
      'auth/register',
      'auth/forgot-password',
      'auth/reset-password',
    ]);
    expect(JSON.parse(String(fetch.mock.calls[2][1]?.body))).toEqual({
      email: '21036001.an@student.iuh.edu.vn',
      resetCode: '123456',
      newPassword: 'Moi@12345',
    });
  });

  test('isValidPassword requires upper, lower, digit and symbol', () => {
    expect(isValidPassword('Abcd@1234')).toBe(true);
    for (const weak of ['abcd@1234', 'ABCD@1234', 'Abcdefg@', 'Abcd1234', 'Ab@1', 'Abcd @1234']) {
      expect(isValidPassword(weak)).toBe(false);
    }
  });
  test('sign out clears the local token even when the server is unreachable', async () => {
    jest.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('offline'));
    await expect(signOut()).resolves.toBeUndefined();
    expect(clearToken).toHaveBeenCalled();
  });

  test('returns only public profile fields from the API', async () => {
    const profile = { id: 'user-001', fullName: 'Demo Student', avatarUrl: '' };
    jest.spyOn(globalThis, 'fetch').mockResolvedValue(mockJsonResponse(profile));
    await expect(getPublicUserById('user-001')).resolves.toEqual(profile);
  });

  test('surfaces unavailable JSON Server instead of silently logging in', async () => {
    jest.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('connection refused'));
    await expect(signInWithPassword('21036001.student@student.iuh.edu.vn', 'Demo@1234')).rejects.toMatchObject<
      Partial<ApiClientError>
    >({ code: 'NETWORK_ERROR', status: 0 });
  });
});
