export type UserRole = 'student' | 'moderator';

export interface User {
  id: string;
  email: string;
  fullName: string;
  studentId: string;
  avatarUrl: string;
  phoneNumber?: string;
  faculty?: string;
  className?: string;
  successfulExchanges?: number;
  reputation?: number;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export type PublicUser = Pick<User, 'id' | 'fullName' | 'avatarUrl'>
  & Partial<Pick<User, 'faculty' | 'className' | 'successfulExchanges' | 'reputation'>>;

export interface AuthSession {
  token: string;
  user: User;
}

export type EditableProfile = Pick<User, 'faculty' | 'className' | 'avatarUrl'>;