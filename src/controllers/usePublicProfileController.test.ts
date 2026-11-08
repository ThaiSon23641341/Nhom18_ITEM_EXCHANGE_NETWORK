import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { PublicUser } from '../models/userModel';
import { getPublicUser } from '../services/api/userService';
import {
  notifyPublicProfileFocused,
  usePublicProfileController,
} from './usePublicProfileController';

jest.mock('../services/api/userService', () => ({
  getPublicUser: jest.fn(),
}));

const mockGetPublicUser = jest.mocked(getPublicUser);

describe('usePublicProfileController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('reloads the latest public profile whenever the screen regains focus', async () => {
    const originalProfile: PublicUser = {
      id: 'user-001',
      fullName: 'Student Example',
      avatarUrl: '/uploads/avatar.jpg',
      faculty: 'Khoa cũ',
      className: 'Lớp cũ',
      successfulExchanges: 1,
      reputation: 20,
    };
    const updatedProfile: PublicUser = {
      ...originalProfile,
      faculty: 'Khoa mới',
      className: 'Lớp mới',
      successfulExchanges: 2,
      reputation: 40,
    };
    mockGetPublicUser
      .mockResolvedValueOnce(originalProfile)
      .mockResolvedValueOnce(updatedProfile);

    const { result, unmount } = await renderHook(() => usePublicProfileController('user-001'));
    await waitFor(() => expect(result.current.profile).toEqual(originalProfile));

    await act(async () => {
      notifyPublicProfileFocused();
    });
    await waitFor(() => expect(result.current.profile).toEqual(updatedProfile));

    expect(mockGetPublicUser).toHaveBeenCalledTimes(2);
    expect(mockGetPublicUser).toHaveBeenCalledWith('user-001');
    unmount();
  });
});
