import { createAsyncThunk } from "@reduxjs/toolkit";
import { get } from "~/services/httpMethods/get";
import { post as httpPost } from "~/services/httpMethods/post";
import type {
  AuthUser,
  LoginDto,
  SignupDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  VerifyEmailDto,
} from "~/types/auth.d";
import { Role } from "~/enums/role.enum";

interface RawUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
  isEmailVerified: boolean;
  messId?: string | null;
  messName?: string | null;
  messCode?: string | null;
}

function mapRawUser(raw: RawUser): AuthUser {
  return {
    id: raw.id,
    name: raw.fullName,
    email: raw.email,
    role: raw.role.toLowerCase() as Role,
    isEmailVerified: raw.isEmailVerified,
    messId: raw.messId ?? null,
    messName: raw.messName ?? null,
    messCode: raw.messCode ?? null,
  };
}

export const fetchCurrentUser = createAsyncThunk<AuthUser>(
  "auth/fetchCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const res = await get<{ data: RawUser }>("/auth/me");
      return mapRawUser(res.data);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        error.response?.data?.message ?? "Failed to fetch user",
      );
    }
  },
);

export async function loginUser(dto: LoginDto): Promise<AuthUser> {
  const res = await httpPost<{ data: RawUser }>("/auth/login", dto);
  return mapRawUser(res.data);
}

export async function signupUser(dto: SignupDto): Promise<void> {
  await httpPost("/auth/register", dto);
}

export async function logoutUser(): Promise<void> {
  await httpPost("/auth/logout");
}

export async function forgotPassword(dto: ForgotPasswordDto): Promise<void> {
  await httpPost("/auth/forgot-password", dto);
}

export async function resetPassword(dto: ResetPasswordDto): Promise<void> {
  await httpPost("/auth/reset-password", dto);
}

export async function verifyEmail(dto: VerifyEmailDto): Promise<void> {
  await httpPost("/auth/verify-email", dto);
}

export async function resendVerification(email: string): Promise<void> {
  await httpPost("/auth/resend-verification", { email });
}

export async function refreshToken(): Promise<void> {
  await httpPost("/auth/refresh");
}
