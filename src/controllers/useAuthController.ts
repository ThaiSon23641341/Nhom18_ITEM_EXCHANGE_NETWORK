import { useCallback, useState } from 'react';
import type { User } from '../models/userModel';
import { ApiClientError } from '../services/api/apiClient';
import { signInWithEmail } from '../services/authService';
import { clearAuthenticatedUser, setAuthenticatedUser } from '../store/authSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isSubmitting: boolean;
  login: (email: string) => Promise<boolean>;
  logout: () => void;
  loginError: string | null;
}

export function isValidStudentEmail(email: string): boolean {
  return /^(?:[0-9]{8}\.[a-zA-Z]+(?:[.-][a-zA-Z]+)*|sinhvien001|sinhvien002|moderator)@student\.iuh\.edu\.vn$/i
    .test(email.trim());
}

export function useAuthController(): AuthState {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const login = useCallback(async (email: string): Promise<boolean> => {
    const normalizedEmail = email.trim();
    if (!isValidStudentEmail(normalizedEmail)) {
      setLoginError('Vui lòng dùng email sinh viên IUH hợp lệ.');
      return false;
    }

    setIsSubmitting(true);
    setLoginError(null);
    try {
      const signedInUser = await signInWithEmail(normalizedEmail);
      dispatch(setAuthenticatedUser(signedInUser));
      return true;
    } catch (error) {
      setLoginError(
        error instanceof ApiClientError
          ? error.message
          : error instanceof Error
            ? error.message
            : 'Đăng nhập không thành công.',
      );
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [dispatch]);

  const logout = useCallback(() => {
    dispatch(clearAuthenticatedUser());
  }, [dispatch]);

  return {
    user,
    isAuthenticated: user !== null,
    isSubmitting,
    login,
    logout,
    loginError,
  };
}
