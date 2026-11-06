import { useEffect } from 'react';
import { ApiClientError } from '../services/api/apiClient';
import { clearToken, loadStoredToken } from '../services/api/tokenStorage';
import { fetchSession } from '../services/authService';
import { setAuthenticatedUser, setSessionRestoring } from '../store/authSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';

// Restores the signed-in user from the stored token once on app start.
export function useSessionBootstrap(): { isRestoring: boolean } {
  const dispatch = useAppDispatch();
  const isRestoring = useAppSelector((state) => state.auth.isRestoring);

  useEffect(() => {
    let active = true;
    (async () => {
      dispatch(setSessionRestoring(true));
      try {
        const token = await loadStoredToken();
        if (!token) return;
        const user = await fetchSession();
        if (active) dispatch(setAuthenticatedUser(user));
      } catch (error) {
        // Keep the token when the server is merely unreachable; drop it when rejected.
        if (error instanceof ApiClientError && error.status === 401) await clearToken();
      } finally {
        if (active) dispatch(setSessionRestoring(false));
      }
    })();
    return () => {
      active = false;
    };
  }, [dispatch]);

  return { isRestoring };
}
