import { ApiClientError } from './api/apiClient';
import { getPublicUserById, signInWithEmail } from './authService';

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

  test('uses the existing JSON Server student record', async () => {
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
    const fetch = jest.spyOn(globalThis, 'fetch').mockResolvedValue(mockJsonResponse([user]));

    await expect(signInWithEmail(` ${user.email.toUpperCase()} `)).resolves.toEqual(user);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/users?email=sinhvien001%40student.iuh.edu.vn'),
      expect.any(Object),
    );
  });

  test('creates a fake student record for a valid demo email', async () => {
    jest.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(mockJsonResponse([]))
      .mockResolvedValueOnce(mockJsonResponse({
        id: 'student-23636991',
        email: '23636991.phuc@student.iuh.edu.vn',
        studentId: '23636991',
        fullName: 'Phuc',
        avatarUrl: '',
        role: 'student',
      }, 201));

    await expect(signInWithEmail('23636991.phuc@student.iuh.edu.vn')).resolves.toMatchObject({
      id: 'student-23636991',
      role: 'student',
    });
    const [, options] = jest.mocked(globalThis.fetch).mock.calls[1];
    expect(JSON.parse(String(options?.body))).toMatchObject({
      email: '23636991.phuc@student.iuh.edu.vn',
      studentId: '23636991',
      role: 'student',
    });
  });

  test('returns only public profile fields from the API', async () => {
    const profile = { id: 'user-001', fullName: 'Demo Student', avatarUrl: '' };
    jest.spyOn(globalThis, 'fetch').mockResolvedValue(mockJsonResponse(profile));
    await expect(getPublicUserById('user-001')).resolves.toEqual(profile);
  });

  test('surfaces unavailable JSON Server instead of silently logging in', async () => {
    jest.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('connection refused'));
    await expect(signInWithEmail('21036001.student@student.iuh.edu.vn')).rejects.toMatchObject<
      Partial<ApiClientError>
    >({ code: 'NETWORK_ERROR', status: 0 });
  });
});
