import { useCallback, useEffect, useState } from 'react';
import type { PublicUser } from '../models/userModel';
import { getPublicUser } from '../services/api/userService';

const profileFocusListeners = new Set<() => void>();

export function notifyPublicProfileFocused(): void {
  profileFocusListeners.forEach((listener) => listener());
}

export function usePublicProfileController(userId: string) {
  const [profile, setProfile] = useState<PublicUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback((isActive: () => boolean = () => true) => {
    setIsLoading(true);
    setError(null);

    return getPublicUser(userId)
      .then((loadedProfile) => {
        if (!isActive()) return;
        setProfile(loadedProfile);
        setError(null);
      })
      .catch((loadError: unknown) => {
        if (!isActive()) return;
        setProfile(null);
        setError(loadError instanceof Error ? loadError.message : 'Không thể tải hồ sơ.');
      })
      .finally(() => {
        if (isActive()) setIsLoading(false);
      });
  }, [userId]);

  useEffect(() => {
    let active = true;
    const refresh = () => {
      void loadProfile(() => active);
    };

    profileFocusListeners.add(refresh);
    refresh();
    return () => {
      active = false;
      profileFocusListeners.delete(refresh);
    };
  }, [loadProfile]);

  const retry = useCallback(() => {
    void loadProfile();
  }, [loadProfile]);

  return {
    profile,
    isLoading,
    error,
    retry,
  };
}
