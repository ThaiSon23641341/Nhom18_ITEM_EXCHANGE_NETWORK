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

import { useCallback, useMemo, useState } from 'react';
import type { User } from '../models/userModel';
import { MOCK_USER, USE_MOCK_USER } from '../utils/constants';

let currentUser: User | null = USE_MOCK_USER ? MOCK_USER : null;

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string) => boolean;
  loginError: string | null;
}

const STUDENT_EMAIL_PATTERN =
  /^[0-9]{8}\.[a-zA-Z]+(?:[.-][a-zA-Z]+)*@student\.iuh\.edu\.vn$/i;

export function isValidStudentEmail(email: string): boolean {
  return STUDENT_EMAIL_PATTERN.test(email.trim());
}

/**
 * useAuthController
 * Mô phỏng đăng nhập trong bộ nhớ để kiểm thử điều hướng và định dạng email.
 * Chưa xác minh danh tính với backend.
 */
export function useAuthController(): AuthState {
  const [user, setUser] = useState<User | null>(currentUser);
  const [loginError, setLoginError] = useState<string | null>(null);

  const login = useCallback((email: string): boolean => {
    const normalizedEmail = email.trim();

    if (!isValidStudentEmail(normalizedEmail)) {
      setLoginError(
        'Email phải có dạng 8 chữ số.tên@student.iuh.edu.vn; tên chỉ gồm chữ cái, dấu chấm hoặc gạch nối.',
      );
      return false;
    }

    const studentId = normalizedEmail.slice(0, 8);
    const authenticatedUser: User = {
      ...MOCK_USER,
      id: studentId,
      studentId,
      email: normalizedEmail,
    };

    currentUser = authenticatedUser;
    setUser(authenticatedUser);
    setLoginError(null);
    return true;
  }, []);

  return useMemo(
    () => ({
      user,
      isAuthenticated: user !== null,
      login,
      loginError,
    }),
    [user, login, loginError],
  );
}
