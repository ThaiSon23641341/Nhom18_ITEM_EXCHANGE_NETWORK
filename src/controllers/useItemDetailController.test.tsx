import { renderHook, waitFor } from '@testing-library/react-native';
import type { Item } from '../models/itemModel';
import type { PublicUser } from '../models/userModel';
import { getItemById } from '../services/api/itemService';
import { getPublicUser } from '../services/api/userService';
import { useItemDetailController } from './useItemDetailController';

jest.mock('../services/api/itemService', () => ({
  getItemById: jest.fn(),
  MockApiError: class MockApiError extends Error {
    code: string;

    constructor(message: string, code: string) {
      super(message);
      this.code = code;
    }
  },
}));

jest.mock('../services/api/userService', () => ({
  getPublicUser: jest.fn(),
}));

const item = {
  id: 'item-001',
  title: 'Sample item',
  description: 'Sample description',
  category: 'Study tools',
  condition: 'good',
  imageUrl: '',
  status: 'available',
  ownerId: 'user-001',
  createdAt: '2026-11-01T00:00:00.000Z',
  updatedAt: '2026-11-01T00:00:00.000Z',
} as Item;

const profile = {
  id: 'user-001',
  fullName: 'Owner Sample',
  avatarUrl: '',
  faculty: 'Khoa Công nghệ thông tin',
  reputation: 75,
} satisfies PublicUser;

describe('useItemDetailController', () => {
  beforeEach(() => jest.resetAllMocks());

  test('loads the item and its owner public profile', async () => {
    jest.mocked(getItemById).mockResolvedValue(item);
    jest.mocked(getPublicUser).mockResolvedValue(profile);

    const { result } = await renderHook(() => useItemDetailController(item.id));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(getPublicUser).toHaveBeenCalledWith(item.ownerId);
    expect(result.current.item).toEqual(item);
    expect(result.current.ownerProfile).toEqual(profile);
    expect(result.current.ownerProfileError).toBeNull();
  });

  test('keeps the item visible when the public profile request fails', async () => {
    jest.mocked(getItemById).mockResolvedValue(item);
    jest.mocked(getPublicUser).mockRejectedValue(new Error('Profile unavailable'));

    const { result } = await renderHook(() => useItemDetailController(item.id));

    await waitFor(() => expect(result.current.ownerProfileError).toBe('Profile unavailable'));
    expect(result.current.item).toEqual(item);
    expect(result.current.loadError).toBeNull();
  });
});
