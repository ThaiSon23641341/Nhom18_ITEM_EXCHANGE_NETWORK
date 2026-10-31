import type { PublicUser, User } from '../models/userModel';
import { ApiClientError, apiRequest } from './api/apiClient';

const STUDENT_EMAIL_PATTERN =
  /^(?:([0-9]{8})\.([a-zA-Z]+(?:[.-][a-zA-Z]+)*)|sinhvien001|sinhvien002|moderator)@student\.iuh\.edu\.vn$/i;

const titleCaseName = (value: string): string =>
  value
    .split(/[.-]/)
    .filter(Boolean)
    .map((part) => `${part[0].toLocaleUpperCase('vi')}${part.slice(1).toLocaleLowerCase('vi')}`)
    .join(' ');

export function isValidStudentEmail(email: string): boolean {
  return STUDENT_EMAIL_PATTERN.test(email.trim());
}

export async function signInWithEmail(email: string): Promise<User> {
  const normalizedEmail = email.trim().toLowerCase();
  const match = STUDENT_EMAIL_PATTERN.exec(normalizedEmail);
  if (!match) {
    throw new ApiClientError(
      'Vui lòng dùng email sinh viên IUH hợp lệ.',
      'BAD_REQUEST',
      400,
    );
  }

  const existingUsers = await apiRequest<User[]>(
    `/users?email=${encodeURIComponent(normalizedEmail)}`,
  );
  const existingUser = existingUsers.find((candidate) => candidate.email === normalizedEmail);
  if (existingUser) return existingUser;

  const studentId = match[1];
  const studentName = match[2];
  if (!studentId || !studentName) {
    throw new ApiClientError(
      'Không tìm thấy tài khoản demo. Dùng một email sinh viên có mã 8 chữ số.',
      'NOT_FOUND',
      404,
    );
  }

  const now = new Date().toISOString();
  return apiRequest<User>('/users', {
    method: 'POST',
    body: JSON.stringify({
      id: `student-${studentId}`,
      email: normalizedEmail,
      studentId,
      fullName: titleCaseName(studentName),
      avatarUrl: '',
      role: 'student',
      createdAt: now,
      updatedAt: now,
    }),
  });
}

export async function getPublicUserById(id: string): Promise<PublicUser> {
  if (!id.trim()) {
    throw new ApiClientError('Thiếu mã người dùng.', 'BAD_REQUEST', 400);
  }
  return apiRequest<PublicUser>(`/users/${encodeURIComponent(id)}/public`);
}
