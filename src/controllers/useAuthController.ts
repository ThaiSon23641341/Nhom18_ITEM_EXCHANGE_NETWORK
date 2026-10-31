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

import { useCallback, useState, useSyncExternalStore } from 'react';
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
  login: (email: string) => boolean;
  logout: () => void;
  loginError: string | null;
}

const STUDENT_EMAIL_PATTERN =
  /^(?:[0-9]{8}\.[a-zA-Z]+(?:[.-][a-zA-Z]+)*|sinhvien001|sinhvien002|moderator)@student\.iuh\.edu\.vn$/i;

export function isValidStudentEmail(email: string): boolean {
  return STUDENT_EMAIL_PATTERN.test(email.trim());
}

/**
 * useAuthController
 * Mô phỏng đăng nhập trong bộ nhớ để kiểm thử điều hướng và định dạng email.
 * Chưa xác minh danh tính với backend.
 */
export function useAuthController(): AuthState {
  const user = useSyncExternalStore(subscribeToAuth, getCurrentUser, getCurrentUser);
  const [loginError, setLoginError] = useState<string | null>(null);

  const login = useCallback((email: string): boolean => {
    const normalizedEmail = email.trim();

    if (!isValidStudentEmail(normalizedEmail)) {
      setLoginError('Vui lòng dùng email sinh viên IUH hợp lệ.');
      return false;
    }

    try {
      signInWithEmail(normalizedEmail);
      setLoginError(null);
      return true;
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'Đăng nhập không thành công.');
      return false;
    }
  }, []);

  const logout = useCallback(() => signOut(), []);

  return { user, isAuthenticated: user !== null, login, logout, loginError };
}
