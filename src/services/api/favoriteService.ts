import type { Favorite } from '../../models';
import { apiRequest } from './apiClient';

export async function getFavorite(userId: string, itemId: string): Promise<Favorite | null> {
  const favorites = await apiRequest<Favorite[]>(
    `/favorites?userId=${encodeURIComponent(userId)}&itemId=${encodeURIComponent(itemId)}`,
  );
  return favorites[0] ?? null;
}

export async function addFavorite(userId: string, itemId: string): Promise<Favorite> {
  return apiRequest<Favorite>('/favorites', {
    method: 'POST',
    body: JSON.stringify({
      id: `favorite-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      userId,
      itemId,
      createdAt: new Date().toISOString(),
    }),
  });
}

export async function removeFavorite(favoriteId: string): Promise<void> {
  await apiRequest<void>(`/favorites/${encodeURIComponent(favoriteId)}`, { method: 'DELETE' });
}
