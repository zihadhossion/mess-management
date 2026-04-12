import type { Role } from "~/enums/role.enum";
import type { MessStatus } from "~/enums/mess-status.enum";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  isEmailVerified: boolean;
  isActive: boolean;
  messId: string | null;
  messName: string | null;
  createdAt: string;
}

export interface AdminMess {
  id: string;
  name: string;
  code: string;
  status: MessStatus;
  managerId: string;
  managerName: string;
  memberCount: number;
  createdAt: string;
}

export interface AdminState {
  users: AdminUser[];
  messes: AdminMess[];
  pendingRequests: number;
  isLoading: boolean;
  error: string | null;
}

export interface PlatformStats {
  totalUsers: number;
  totalMesses: number;
  activeMembers: number;
  pendingRequests: number;
  totalInvoicesThisMonth: number;
  revenueThisMonth: number;
}

export interface MessCreationRequestAdmin {
  id: string;
  messName: string;
  description: string | null;
  address: string | null;
  currency: string;
  status: MessStatus;
  managerId: string;
  managerName: string;
  managerEmail: string;
  reviewNote: string | null;
  createdAt: string;
}

export interface MessDeletionRequest {
  id: string;
  messId: string;
  messName: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  managerId: string;
  managerName: string;
  createdAt: string;
}

export interface AdminConfig {
  maxMembersPerMess: number;
  defaultMealRate: number;
  allowSelfRegistration: boolean;
  requireEmailVerification: boolean;
  maintenanceMode: boolean;
}
