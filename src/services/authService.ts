import type { PublicUser, User } from '../models/userModel';
import { ApiClientError, apiRequest } from './api/apiClient';

const STUDENT_EMAIL_PATTERN =
  /^(?:([0-9]{8})\.([a-zA-Z]+(?:[.-][a-zA-Z]+)*)|sinhvien001|sinhvien002|moderator)@student\.iuh\.edu\.vn$/i;
// Keep in sync with server/lib/credentials.cjs.
const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])\S{8,64}$/;

export const INVALID_EMAIL_MESSAGE = 'Vui lòng dùng email sinh viên IUH hợp lệ.';
export const INVALID_PASSWORD_MESSAGE =
  'Mật khẩu 8–64 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt, không có khoảng trắng.';

export function isValidStudentEmail(email: string): boolean {
  return STUDENT_EMAIL_PATTERN.test(email.trim());
}

export function isValidPassword(password: string): boolean {
  return PASSWORD_PATTERN.test(password);
}

function postAuth<T>(path: string, body: Record<string, string>): Promise<T> {
  return apiRequest<T>(path, { method: 'POST', body: JSON.stringify(body) });
}

export async function signInWithPassword(email: string, password: string): Promise<User> {
  if (!isValidStudentEmail(email)) {
    throw new ApiClientError(INVALID_EMAIL_MESSAGE, 'BAD_REQUEST', 400);
  }
  if (!password) {
    throw new ApiClientError('Vui lòng nhập mật khẩu.', 'BAD_REQUEST', 400);
  }
  return postAuth<User>('/auth/login', { email: email.trim().toLowerCase(), password });
}

export async function registerAccount(email: string, password: string): Promise<User> {
  if (!isValidStudentEmail(email)) {
    throw new ApiClientError(INVALID_EMAIL_MESSAGE, 'BAD_REQUEST', 400);
  }
  if (!isValidPassword(password)) {
    throw new ApiClientError(INVALID_PASSWORD_MESSAGE, 'BAD_REQUEST', 400);
  }
  return postAuth<User>('/auth/register', { email: email.trim().toLowerCase(), password });
}

export interface PasswordResetRequest {
  resetCode: string;
  expiresInSeconds: number;
}

export async function requestPasswordReset(email: string): Promise<PasswordResetRequest> {
  if (!isValidStudentEmail(email)) {
    throw new ApiClientError(INVALID_EMAIL_MESSAGE, 'BAD_REQUEST', 400);
  }
  return postAuth<PasswordResetRequest>('/auth/forgot-password', {
    email: email.trim().toLowerCase(),
  });
}

export async function resetPassword(
  email: string,
  resetCode: string,
  newPassword: string,
): Promise<void> {
  if (!isValidPassword(newPassword)) {
    throw new ApiClientError(INVALID_PASSWORD_MESSAGE, 'BAD_REQUEST', 400);
  }
  await postAuth<{ ok: true }>('/auth/reset-password', {
    email: email.trim().toLowerCase(),
    resetCode: resetCode.trim(),
    newPassword,
  });
}

export async function getPublicUserById(id: string): Promise<PublicUser> {
  if (!id.trim()) {
    throw new ApiClientError('Thiếu mã người dùng.', 'BAD_REQUEST', 400);
  }
  return apiRequest<PublicUser>(`/users/${encodeURIComponent(id)}/public`);
}
