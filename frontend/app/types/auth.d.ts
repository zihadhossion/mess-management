import type { Role } from "~/enums/role.enum";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  isEmailVerified: boolean;
  messId: string | null;
  messName: string | null;
  messCode: string | null;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface SignupDto {
  name: string;
  email: string;
  password: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  token: string;
  password: string;
}

export interface VerifyEmailDto {
  token: string;
}

export interface LoginResponse {
  user: AuthUser;
  accessToken: string;
}
