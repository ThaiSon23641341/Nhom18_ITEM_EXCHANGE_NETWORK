import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { User } from '../models/userModel';
import type { PickedImage } from '../services/media/imagePickerService';
import { uploadImage } from '../services/api/uploadService';
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
const localAvatar: PickedImage = {
  uri: 'file:///new-avatar.tmp',
  mimeType: 'image/jpeg',
  fileName: null,
  asset: {
    uri: 'file:///new-avatar.tmp',
    fileName: null,
    mimeType: 'image/jpeg',
    width: 10,
    height: 10,
    type: 'image',
    assetId: null,
    base64: null,
    duration: null,
    exif: null,
  },
};

jest.mock('../services/api/userService', () => ({
  updateMyProfile: jest.fn(),
}));

jest.mock('../services/api/uploadService', () => ({
  uploadImage: jest.fn(),
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
    const operationOrder: string[] = [];
    jest.mocked(uploadImage).mockImplementation(async () => {
      operationOrder.push('upload');
      return '/uploads/new-avatar.jpg';
    });
    jest.mocked(updateMyProfile).mockImplementation(async () => {
      operationOrder.push('patch');
      return updatedUser;
    });

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
      result.current.setLocalAvatar(localAvatar);
    });
    expect(result.current.localAvatarUri).toBe('file:///new-avatar.tmp');

    let saved = false;
    await act(async () => {
      saved = await result.current.submit();
    });

    expect(saved).toBe(true);
    expect(uploadImage).toHaveBeenCalledWith({
      uri: 'file:///new-avatar.tmp',
      name: 'avatar.jpg',
      type: 'image/jpeg',
    });
    expect(operationOrder).toEqual(['upload', 'patch']);
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
    expect(result.current.localAvatarUri).toBeNull();
  });

  test('does not upload an avatar when no local image was selected', async () => {
    jest.mocked(updateMyProfile).mockResolvedValue(mockSessionUser);
    const { result } = await renderHook(() => useProfileEditController());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.submit();
    });

    expect(uploadImage).not.toHaveBeenCalled();
    expect(updateMyProfile).toHaveBeenCalledWith('user-001', {
      faculty: 'Khoa cũ',
      className: 'Lớp cũ',
      avatarUrl: '/uploads/old-avatar.jpg',
    });
  });

  test('passes only clean upload metadata even when the picker includes asset fields', async () => {
    const imageWithoutMetadata: PickedImage = {
      uri: 'file:///new-avatar.tmp',
      asset: localAvatar.asset,
    };
    jest.mocked(uploadImage).mockResolvedValue('/uploads/new-avatar.jpg');
    jest.mocked(updateMyProfile).mockResolvedValue({
      ...mockSessionUser,
      avatarUrl: '/uploads/new-avatar.jpg',
    });
    const { result } = await renderHook(() => useProfileEditController());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      result.current.setLocalAvatar(imageWithoutMetadata);
    });
    await act(async () => {
      await result.current.submit();
    });

    expect(uploadImage).toHaveBeenCalledWith({
      uri: 'file:///new-avatar.tmp',
      name: 'avatar.jpg',
      type: 'image/jpeg',
    });
    expect(Object.keys(jest.mocked(uploadImage).mock.calls[0][0] ?? {}).sort())
      .toEqual(['name', 'type', 'uri']);
  });

  test('does not patch the profile when avatar upload fails', async () => {
    jest.mocked(uploadImage).mockRejectedValue(new Error('Upload failed'));
    const { result } = await renderHook(() => useProfileEditController());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      result.current.setLocalAvatar(localAvatar);
    });
    let saved = true;
    await act(async () => {
      saved = await result.current.submit();
    });

    expect(saved).toBe(false);
    expect(result.current.submitError).toBe('Upload failed');
    expect(updateMyProfile).not.toHaveBeenCalled();
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
