import { useCallback, useEffect, useState } from 'react';
import type { PublicUser } from '../models/userModel';
import { getPublicUser } from '../services/api/userService';

export function usePublicProfileController(userId: string) {
  const [profile, setProfile] = useState<PublicUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let active = true;
    getPublicUser(userId)
      .then((loadedProfile) => {
        if (!active) return;
        setProfile(loadedProfile);
        setError(null);
      })
      .catch((loadError: unknown) => {
        if (!active) return;
        setProfile(null);
        setError(loadError instanceof Error ? loadError.message : 'Không thể tải hồ sơ.');
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

  return {
    profile,
    isLoading,
    error,
    retry,
  };
}
