import { useCallback, useState } from 'react';
import type { User } from '../models/userModel';
import { ApiClientError } from '../services/api/apiClient';
import {
  INVALID_EMAIL_MESSAGE,
  INVALID_PASSWORD_MESSAGE,
  isValidPassword,
  isValidStudentEmail,
  registerAccount,
  requestPasswordReset,
  resetPassword,
  signInWithPassword,
} from '../services/authService';
import { clearAuthenticatedUser, setAuthenticatedUser } from '../store/authSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';

export { isValidPassword, isValidStudentEmail };

export type LoginResult = 'success' | 'account-not-found' | 'failed';

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isSubmitting: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  register: (email: string, password: string, confirmPassword: string) => Promise<boolean>;
  requestReset: (email: string) => Promise<string | null>;
  completeReset: (
    email: string,
    resetCode: string,
    newPassword: string,
    confirmPassword: string,
  ) => Promise<boolean>;
  logout: () => void;
  loginError: string | null;
  clearError: () => void;
}

const toMessage = (error: unknown, fallback: string): string => (
  error instanceof ApiClientError || error instanceof Error ? error.message : fallback
);

export function useAuthController(): AuthState {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const clearError = useCallback(() => setLoginError(null), []);

  // Runs one submit: validates first, toggles the busy flag and records the error.
  const submit = useCallback(async <T,>(
    validationError: string | null,
    action: () => Promise<T>,
    fallback: string,
    onError?: (error: unknown) => T | undefined,
  ): Promise<T | undefined> => {
    if (validationError) {
      setLoginError(validationError);
      return undefined;
    }
    setIsSubmitting(true);
    setLoginError(null);
    try {
      return await action();
    } catch (error) {
      const handled = onError?.(error);
      if (handled !== undefined) return handled;
      setLoginError(toMessage(error, fallback));
      return undefined;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<LoginResult> => {
    const validationError = !isValidStudentEmail(email)
      ? INVALID_EMAIL_MESSAGE
      : !password
        ? 'Vui lòng nhập mật khẩu.'
        : null;
    const result = await submit<LoginResult>(
      validationError,
      async () => {
        dispatch(setAuthenticatedUser(await signInWithPassword(email, password)));
        return 'success';
      },
      'Đăng nhập không thành công.',
      (error) => (
        error instanceof ApiClientError && error.code === 'ACCOUNT_NOT_FOUND'
          ? 'account-not-found'
          : undefined
      ),
    );
    return result ?? 'failed';
  }, [dispatch, submit]);

  const register = useCallback(async (
    email: string,
    password: string,
    confirmPassword: string,
  ): Promise<boolean> => {
    const validationError = !isValidStudentEmail(email)
      ? INVALID_EMAIL_MESSAGE
      : !isValidPassword(password)
        ? INVALID_PASSWORD_MESSAGE
        : password !== confirmPassword
          ? 'Mật khẩu nhập lại không khớp.'
          : null;
    const created = await submit(
      validationError,
      async () => {
        dispatch(setAuthenticatedUser(await registerAccount(email, password)));
        return true;
      },
      'Tạo tài khoản không thành công.',
    );
    return created === true;
  }, [dispatch, submit]);

  const requestReset = useCallback(async (email: string): Promise<string | null> => {
    const reset = await submit(
      isValidStudentEmail(email) ? null : INVALID_EMAIL_MESSAGE,
      () => requestPasswordReset(email),
      'Không thể gửi mã xác nhận.',
    );
    return reset?.resetCode ?? null;
  }, [submit]);

  const completeReset = useCallback(async (
    email: string,
    resetCode: string,
    newPassword: string,
    confirmPassword: string,
  ): Promise<boolean> => {
    const validationError = !/^\d{6}$/.test(resetCode.trim())
      ? 'Mã xác nhận gồm 6 chữ số.'
      : !isValidPassword(newPassword)
        ? INVALID_PASSWORD_MESSAGE
        : newPassword !== confirmPassword
          ? 'Mật khẩu nhập lại không khớp.'
          : null;
    const done = await submit(
      validationError,
      async () => {
        await resetPassword(email, resetCode, newPassword);
        return true;
      },
      'Đặt lại mật khẩu không thành công.',
    );
    return done === true;
  }, [submit]);

  const logout = useCallback(() => {
    dispatch(clearAuthenticatedUser());
  }, [dispatch]);

  return {
    user,
    isAuthenticated: user !== null,
    isSubmitting,
    login,
    register,
    requestReset,
    completeReset,
    logout,
    loginError,
    clearError,
  };
}
