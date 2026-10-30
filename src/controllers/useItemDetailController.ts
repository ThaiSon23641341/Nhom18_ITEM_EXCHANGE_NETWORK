import { useCallback, useEffect, useState } from 'react';
import type { Item } from '../models/itemModel';
import { getItemById, MockApiError } from '../services/api/itemService';

export function useItemDetailController(itemId: string | undefined) {
  const [item, setItem] = useState<Item | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let isActive = true;

    if (!itemId) {
      return () => {
        isActive = false;
      };
    }

    // Reset the request state when navigating between item IDs.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true);
    setLoadError(null);
    getItemById(itemId)
      .then((loadedItem) => {
        if (isActive) setItem(loadedItem);
      })
      .catch((error: unknown) => {
        if (!isActive) return;
        setItem(null);
        setLoadError(
          error instanceof MockApiError
            ? 'Không tìm thấy đồ dùng này.'
            : 'Không thể tải thông tin đồ dùng. Vui lòng thử lại.',
        );
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [itemId, retryCount]);

  const retry = useCallback(() => setRetryCount((count) => count + 1), []);

  return {
    item: itemId ? item : null,
    isLoading: itemId ? isLoading : false,
    loadError: itemId ? loadError : 'Không tìm thấy mã đồ dùng.',
    retry,
  };
}
