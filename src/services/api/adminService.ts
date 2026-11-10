import type { User } from '../../models/userModel';
import { apiRequest } from './apiClient';

export type AdminUserUpdate =
  | { isBanned: boolean }
  | { reputationDelta: -10 | 10 };

export const getAdminUsers = (): Promise<User[]> => apiRequest<User[]>('/admin/users');

export const updateAdminUser = (
  userId: string,
  update: AdminUserUpdate,
): Promise<User> => apiRequest<User>(`/admin/users/${encodeURIComponent(userId)}`, {
  method: 'PATCH',
  body: JSON.stringify(update),
});
