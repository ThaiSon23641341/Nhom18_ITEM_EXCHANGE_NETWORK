export type UserRole = 'student' | 'moderator';

export interface User {
  id: string;
  email: string;
  fullName: string;
  studentId: string;
  avatarUrl: string;
  phoneNumber?: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export type PublicUser = Pick<User, 'id' | 'fullName' | 'avatarUrl'>;