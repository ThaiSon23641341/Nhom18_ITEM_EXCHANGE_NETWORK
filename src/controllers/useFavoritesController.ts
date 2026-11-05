import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
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
  const loadFavorites = useCallback((isActive: () => boolean = () => true) => {
    return getFavorites(userId)
      .then((loadedFavorites) => {
        if (!isActive()) return;
        setFavorites(loadedFavorites);
        setError(null);
      })
      .catch((loadError: unknown) => {
        if (!isActive()) return;
        setError(loadError instanceof Error
          ? loadError.message
          : 'Không thể tải danh sách yêu thích.');
      })
      .finally(() => {
        if (isActive()) setIsLoading(false);
      });
  }, [userId]);

  useFocusEffect(useCallback(() => {
    let active = true;
    void loadFavorites(() => active);
    return () => {
      active = false;
    };
  }, [loadFavorites]));

  const retry = useCallback(() => {
    setIsLoading(true);
    setError(null);
    void loadFavorites();
  }, [loadFavorites]);

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
