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

import { useMemo } from 'react';
import type { User } from '../models/userModel';
import { MOCK_USER, USE_MOCK_USER } from '../utils/constants';

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

/**
 * useAuthController
 * Trả về { user, isAuthenticated }.
 * View (index.tsx) đọc isAuthenticated rồi dùng <Redirect> của Expo Router.
 */
export function useAuthController(): AuthState {
  // useMemo: tránh tạo lại object mỗi lần render (CLO2)
  const state = useMemo<AuthState>((): AuthState => {
    if (USE_MOCK_USER) {
      return { user: MOCK_USER, isAuthenticated: true };
    }
    return { user: null, isAuthenticated: false };
  }, []);

  return state;
}
