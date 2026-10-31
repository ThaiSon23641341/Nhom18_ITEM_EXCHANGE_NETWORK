import type { User } from '../models/userModel';
import { MOCK_USER } from '../utils/constants';

type AuthListener = () => void;

let currentUser: User | null = null;
const listeners = new Set<AuthListener>();

const notify = () => {
  listeners.forEach((listener) => listener());
};

export function getCurrentUser(): User | null {
  return currentUser;
}

export function subscribeToAuth(listener: AuthListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function signInWithEmail(email: string): User {
  const normalizedEmail = email.trim().toLowerCase();
  if (!/^[^@\s]+@student\.iuh\.edu\.vn$/.test(normalizedEmail)) {
    throw new Error('Vui lòng dùng email sinh viên IUH hợp lệ.');
  }

  const demoAccounts: Record<string, Pick<User, 'id' | 'fullName' | 'studentId'>> = {
    'sinhvien001@student.iuh.edu.vn': {
      id: 'user-001',
      fullName: 'Nguyen Minh Anh',
      studentId: '21036001',
    },
    'sinhvien002@student.iuh.edu.vn': {
      id: 'user-002',
      fullName: 'Tran Gia Bao',
      studentId: '21036002',
    },
    'moderator@student.iuh.edu.vn': {
      id: 'user-003',
      fullName: 'Demo Moderator',
      studentId: '21036003',
    },
  };
  const account = demoAccounts[normalizedEmail] ?? {
    id: MOCK_USER.id,
    fullName: MOCK_USER.fullName,
    studentId: MOCK_USER.studentId,
  };

  currentUser = {
    ...MOCK_USER,
    email: normalizedEmail,
    ...account,
  };
  notify();
  return currentUser;
}

export function signOut(): void {
  currentUser = null;
  notify();
}
