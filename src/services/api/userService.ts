import type { EditableProfile, PublicUser, User } from '../../models/userModel';
import { apiRequest } from './apiClient';

export const updateMyProfile = (
  userId: string,
  changes: Partial<EditableProfile>,
): Promise<User> => apiRequest<User>(`/users/${encodeURIComponent(userId)}`, {
  method: 'PATCH',
  body: JSON.stringify(changes),
});

export const getPublicUser = (userId: string): Promise<PublicUser> => {
  const normalizedId = userId.trim();
  if (!normalizedId) {
    return Promise.reject(new Error('Mã người dùng là bắt buộc.'));
  }
  return apiRequest<PublicUser>(`/users/${encodeURIComponent(normalizedId)}/public`);
};
