import { useCallback, useEffect, useState } from 'react';
import type { Item } from '../models/itemModel';
import type { PublicUser } from '../models/userModel';
import { getItemById, MockApiError } from '../services/api/itemService';
import { getPublicUser } from '../services/api/userService';

export function useItemDetailController(itemId: string | undefined) {
  const [item, setItem] = useState<Item | null>(null);
  const [ownerProfile, setOwnerProfile] = useState<PublicUser | null>(null);
  const [ownerProfileError, setOwnerProfileError] = useState<string | null>(null);
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
    setItem(null);
    setOwnerProfile(null);
    setOwnerProfileError(null);
    setLoadError(null);
    getItemById(itemId)
      .then(async (loadedItem) => {
        if (!isActive) return;
        setItem(loadedItem);
        if (!loadedItem.ownerId.trim()) return;

        try {
          const profile = await getPublicUser(loadedItem.ownerId);
          if (isActive) setOwnerProfile(profile);
        } catch (error) {
          if (isActive) {
            setOwnerProfileError(
              error instanceof Error
                ? error.message
                : 'Không thể tải hồ sơ công khai của người đăng.',
            );
          }
        }
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
    ownerProfile: itemId ? ownerProfile : null,
    ownerProfileError: itemId ? ownerProfileError : null,
    isLoading: itemId ? isLoading : false,
    loadError: itemId ? loadError : 'Không tìm thấy mã đồ dùng.',
    retry,
  };
}
