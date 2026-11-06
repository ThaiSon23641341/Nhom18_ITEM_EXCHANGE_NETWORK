import type { Favorite } from '../../models/favoriteModel';
import { ApiClientError, apiRequest, encodeQueryValue } from './apiClient';

export class FavoriteServiceError extends Error {
  constructor(
    message: string,
    public readonly code: 'BAD_REQUEST' | 'NOT_FOUND' | 'CONFLICT' | 'NETWORK_ERROR' | 'UNKNOWN',
  ) {
    super(message);
    this.name = 'FavoriteServiceError';
  }
}

const mapError = (error: unknown): FavoriteServiceError => {
  if (error instanceof ApiClientError) {
    const code = error.code === 'NOT_FOUND'
      ? 'NOT_FOUND'
      : error.code === 'CONFLICT'
        ? 'CONFLICT'
        : error.code === 'NETWORK_ERROR'
          ? 'NETWORK_ERROR'
          : error.code === 'UNKNOWN'
            ? 'UNKNOWN'
            : 'BAD_REQUEST';
    return new FavoriteServiceError(error.message, code);
  }
  if (error instanceof Error) return new FavoriteServiceError(error.message, 'BAD_REQUEST');
  return new FavoriteServiceError('Yêu cầu yêu thích không thành công.', 'BAD_REQUEST');
};

const validateIdentifiers = (...identifiers: string[]): void => {
  if (identifiers.some((identifier) => !identifier.trim())) {
    throw new FavoriteServiceError('Mã người dùng và bài đăng là bắt buộc.', 'BAD_REQUEST');
  }
};

export const getFavorites = async (userId: string): Promise<Favorite[]> => {
  validateIdentifiers(userId);
  try {
    return await apiRequest<Favorite[]>(
      `/favorites?userId=${encodeQueryValue(userId.trim())}`,
    );
  } catch (error) {
    throw mapError(error);
  }
};

export const addFavorite = async (
  userId: string,
  itemId: string,
): Promise<Favorite> => {
  validateIdentifiers(userId, itemId);
  try {
    return await apiRequest<Favorite>('/favorites', {
      method: 'POST',
      body: JSON.stringify({ userId: userId.trim(), itemId: itemId.trim() }),
    });
  } catch (error) {
    throw mapError(error);
  }
};

export const removeFavorite = async (id: string): Promise<void> => {
  validateIdentifiers(id);
  try {
    await apiRequest<void>(`/favorites/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  } catch (error) {
    throw mapError(error);
  }
};
