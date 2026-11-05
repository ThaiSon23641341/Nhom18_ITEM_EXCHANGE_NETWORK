import { useCallback, useEffect, useState } from 'react';
import type { Favorite } from '../models/favoriteModel';
import {
  addFavorite,
  FavoriteServiceError,
  getFavorites,
  removeFavorite,
} from '../services/api/favoriteService';

export function useFavoritesController(userId: string) {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingItemIds, setPendingItemIds] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let active = true;
    getFavorites(userId)
      .then((loadedFavorites) => {
        if (!active) return;
        setFavorites(loadedFavorites);
        setError(null);
      })
      .catch((loadError: unknown) => {
        if (!active) return;
        setError(loadError instanceof Error
          ? loadError.message
          : 'Không thể tải danh sách yêu thích.');
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [userId, retryCount]);

  const retry = useCallback(() => {
    setIsLoading(true);
    setError(null);
    setRetryCount((count) => count + 1);
  }, []);

  const toggleFavorite = useCallback(async (itemId: string) => {
    if (!userId || pendingItemIds.has(itemId)) return;

    setPendingItemIds((current) => new Set(current).add(itemId));
    setError(null);
    try {
      const existingFavorite = favorites.find((favorite) => favorite.itemId === itemId);
      if (existingFavorite) {
        await removeFavorite(existingFavorite.id);
        setFavorites((current) => current.filter((favorite) => favorite.id !== existingFavorite.id));
      } else {
        const favorite = await addFavorite(userId, itemId);
        setFavorites((current) => current.some((value) => value.id === favorite.id)
          ? current
          : [favorite, ...current]);
      }
    } catch (toggleError) {
      if (toggleError instanceof FavoriteServiceError && toggleError.code === 'CONFLICT') {
        retry();
      }
      setError(toggleError instanceof Error
        ? toggleError.message
        : 'Không thể cập nhật danh sách yêu thích.');
    } finally {
      setPendingItemIds((current) => {
        const next = new Set(current);
        next.delete(itemId);
        return next;
      });
    }
  }, [favorites, pendingItemIds, retry, userId]);

  return {
    favorites,
    isLoading,
    error,
    pendingItemIds,
    retry,
    toggleFavorite,
  };
}
