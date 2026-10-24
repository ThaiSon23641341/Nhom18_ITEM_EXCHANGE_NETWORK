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
  if (!normalizedEmail || !normalizedEmail.includes('@')) {
    throw new Error('Vui lòng nhập email hợp lệ.');
  }

  currentUser = {
    ...MOCK_USER,
    email: normalizedEmail,
  };
  notify();
  return currentUser;
}

export function signOut(): void {
  currentUser = null;
  notify();
}
