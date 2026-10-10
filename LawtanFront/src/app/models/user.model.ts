export type UserRole = 'manager' | 'tech' | 'veto' | 'compta' | 'bouvier';

export interface User {
  id: string;
  numericId?: number;
  name: string;
  email: string;
  role: UserRole;
  roleLabel: string;
  roleBadgeColor: string;
  avatarUrl?: string;
  initials: string;
  title: string;
  phone?: string;
  department: string;
  active?: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
  expiresIn: number;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  title?: string;
  department?: string;
  phone?: string;
}

export interface UpdateUserRequest {
  name?: string;
  role?: UserRole;
  title?: string;
  department?: string;
  phone?: string;
  active?: boolean;
  password?: string;
}

export interface UpdateProfileRequest {
  name: string;
  phone?: string;
  title?: string;
  department?: string;
}

export interface ChangePasswordRequest {
  email: string;
  oldPassword: string;
  newPassword: string;
}
