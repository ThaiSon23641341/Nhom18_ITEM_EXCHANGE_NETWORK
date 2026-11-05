import type { PublicUser } from '../../models/userModel';
import { apiRequest } from './apiClient';

export const getPublicUser = (userId: string): Promise<PublicUser> => {
  const normalizedId = userId.trim();
  if (!normalizedId) {
    return Promise.reject(new Error('Mã người dùng là bắt buộc.'));
  }
  return apiRequest<PublicUser>(`/users/${encodeURIComponent(normalizedId)}/public`);
};
