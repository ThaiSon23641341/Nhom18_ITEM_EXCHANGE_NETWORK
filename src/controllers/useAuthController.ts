/**
 * useAuthController.ts  (camelCase, bắt đầu bằng use — CODING_STANDARDS.md)
 *
 * ⚠️  BẢN TẠM — THÀNH VIÊN A THAY BẰNG BẢN THẬT
 * Bản thật dùng Redux (hoặc Context) và gọi API xác thực thực sự.
 * Bản này chỉ đọc cờ USE_MOCK_USER từ src/utils/constants.ts để
 * giúp cả nhóm kiểm thử routing mà không cần back-end.
 *
 * Controller (MVC): chỉ chứa logic + trạng thái, không có JSX.
 */

import { useCallback, useSyncExternalStore } from 'react';
import type { User } from '../models/userModel';
import {
  getCurrentUser,
  signInWithEmail,
  signOut,
  subscribeToAuth,
} from '../services/authService';

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string) => void;
  logout: () => void;
}

/**
 * useAuthController
 * Trả về { user, isAuthenticated }.
 * View (index.tsx) đọc isAuthenticated rồi dùng <Redirect> của Expo Router.
 */
export function useAuthController(): AuthState {
  const user = useSyncExternalStore(subscribeToAuth, getCurrentUser, getCurrentUser);
  const login = useCallback((email: string) => {
    signInWithEmail(email);
  }, []);
  const logout = useCallback(() => {
    signOut();
  }, []);

  return { user, isAuthenticated: user !== null, login, logout };
}
