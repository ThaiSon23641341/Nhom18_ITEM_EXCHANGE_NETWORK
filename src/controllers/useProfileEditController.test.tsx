import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { User } from '../models/userModel';
import { updateMyProfile } from '../services/api/userService';
import { fetchSession } from '../services/authService';
import { setAuthenticatedUser } from '../store/authSlice';
import { useProfileEditController } from './useProfileEditController';

const mockDispatch = jest.fn();
const mockSessionUser: User = {
  id: 'user-001',
  email: 'student@example.edu',
  fullName: 'Student Example',
  studentId: '21036001',
  phoneNumber: '0900000000',
  avatarUrl: '/uploads/old-avatar.jpg',
  faculty: 'Khoa cũ',
  className: 'Lớp cũ',
  role: 'student',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

jest.mock('../services/api/userService', () => ({
  updateMyProfile: jest.fn(),
}));

jest.mock('../services/authService', () => ({
  fetchSession: jest.fn(),
}));

jest.mock('../store/hooks', () => ({
  useAppDispatch: () => mockDispatch,
}));

jest.mock('./useAuthController', () => ({
  useAuthController: () => ({ user: mockSessionUser }),
}));

describe('useProfileEditController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(fetchSession).mockResolvedValue(mockSessionUser);
  });

  test('loads current session data and updates the authenticated user after save', async () => {
    const updatedUser = {
      ...mockSessionUser,
      faculty: 'Khoa Công nghệ thông tin',
      className: 'DHKTPM17A',
      avatarUrl: '/uploads/new-avatar.jpg',
    };
    jest.mocked(updateMyProfile).mockResolvedValue(updatedUser);

    const { result } = await renderHook(() => useProfileEditController());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.values).toEqual({
      faculty: 'Khoa cũ',
      className: 'Lớp cũ',
      avatarUrl: '/uploads/old-avatar.jpg',
    });

    await act(async () => {
      result.current.setFaculty('Khoa Công nghệ thông tin');
      result.current.setClassName('DHKTPM17A');
      result.current.setAvatarUrl('/uploads/new-avatar.jpg');
    });
    await waitFor(() => {
      expect(result.current.values).toEqual({
        faculty: 'Khoa Công nghệ thông tin',
        className: 'DHKTPM17A',
        avatarUrl: '/uploads/new-avatar.jpg',
      });
    });

    let saved = false;
    await act(async () => {
      saved = await result.current.submit();
    });

    expect(saved).toBe(true);
    expect(updateMyProfile).toHaveBeenCalledWith('user-001', {
      faculty: 'Khoa Công nghệ thông tin',
      className: 'DHKTPM17A',
      avatarUrl: '/uploads/new-avatar.jpg',
    });
    expect(mockDispatch).toHaveBeenCalledWith(setAuthenticatedUser(updatedUser));
    expect(result.current.user).toEqual(updatedUser);
    expect(result.current.values).toEqual({
      faculty: 'Khoa Công nghệ thông tin',
      className: 'DHKTPM17A',
      avatarUrl: '/uploads/new-avatar.jpg',
    });
  });

  test('keeps entered values and reports the server error when save fails', async () => {
    jest.mocked(updateMyProfile).mockRejectedValue(new Error('Server unavailable'));
    const { result } = await renderHook(() => useProfileEditController());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      result.current.setFaculty('Khoa mới');
      result.current.setClassName('Lớp mới');
    });
    await waitFor(() => {
      expect(result.current.values.faculty).toBe('Khoa mới');
      expect(result.current.values.className).toBe('Lớp mới');
    });

    let saved = true;
    await act(async () => {
      saved = await result.current.submit();
    });

    expect(saved).toBe(false);
    expect(result.current.submitError).toBe('Server unavailable');
    expect(result.current.values).toEqual({
      faculty: 'Khoa mới',
      className: 'Lớp mới',
      avatarUrl: '/uploads/old-avatar.jpg',
    });
  });
});
