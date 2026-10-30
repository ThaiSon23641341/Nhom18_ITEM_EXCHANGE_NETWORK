/**
 * constants.ts
 * Hằng số dùng chung toàn ứng dụng.
 * UPPER_SNAKE_CASE theo CODING_STANDARDS.md
 */

import type { User } from '../models/userModel';

// ─── Cờ giả lập (dev flag) ─────────────────────────────────────────────────
// Đặt USE_MOCK_USER = true  → giả lập đã đăng nhập (tabs hiện ra)
// Đặt USE_MOCK_USER = false → giả lập chưa đăng nhập (chuyển về login)
export const USE_MOCK_USER = false;

// ─── Người dùng giả lập ────────────────────────────────────────────────────
// id = 'user-001' để khớp với dữ liệu mẫu của nhóm
export const MOCK_USER: User = {
  id: 'user-001',
  email: 'sinhvien001@iuh.edu.vn',
  fullName: 'Sinh Viên 001',
  studentId: '21036001',
  avatarUrl: '',
  role: 'student',
  createdAt: '2026-10-01T08:00:00.000Z',
  updatedAt: '2026-10-01T08:00:00.000Z',
};

// ─── Misc ───────────────────────────────────────────────────────────────────
export const APP_SCHEME = 'nhom18item';
