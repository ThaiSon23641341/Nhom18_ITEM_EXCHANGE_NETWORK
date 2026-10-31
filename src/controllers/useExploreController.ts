import { useCallback, useEffect, useState } from 'react';
import type { Item } from '../models/itemModel';
import { getItems, subscribeToItemChanges } from '../services/api/itemService';

export function useExploreController() {
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    const unsubscribe = subscribeToItemChanges(() => {
      setLoadError(null);
      setIsLoading(true);
      setReloadCount((count) => count + 1);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    let active = true;

    getItems(1, 50)
      .then(({ data }) => {
        if (active) setItems(data);
      })
      .catch(() => {
        if (active) setLoadError('Không thể tải danh sách đồ dùng. Vui lòng thử lại.');
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [reloadCount]);

  const retry = useCallback(() => {
    setLoadError(null);
    setIsLoading(true);
    setReloadCount((count) => count + 1);
  }, []);

  return { items, isLoading, loadError, retry };
}
