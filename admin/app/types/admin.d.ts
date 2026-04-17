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
  totalUsers: number;
  messes: AdminMess[];
  totalMesses: number;
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
  activeUsers: number;
  suspendedUsers: number;
  bannedUsers: number;
  activeMesses: number;
  pendingMesses: number;
  pendingDeletionRequests: number;
  memberCount: number;
  managerCount: number;
  adminCount: number;
  newRegistrationsToday: number;
  newRegistrationsThisWeek: number;
  newRegistrationsThisMonth: number;
  newMessesThisWeek: number;
  newMessesThisMonth: number;
  totalSharedBillInvoices: number;
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

export interface TrendPoint {
  date: string;
  count: number;
}

export interface RecentActivity {
  id: string;
  type: "registration" | "mess_created" | "deletion_request" | "join_request";
  description: string;
  createdAt: string;
}

export interface LoginHistoryEntry {
  id: string;
  ip: string;
  createdAt: string;
}

export interface EmailTemplate {
  id: string;
  type: string;
  subject: string;
  body: string;
}

export interface MessMember {
  id: string;
  name: string;
  email: string;
  role: string;
  joinDate: string;
  status: string;
}

export interface MessDetail extends AdminMess {
  address: string | null;
  description: string | null;
  currency: string;
  managerEmail: string;
  coManagerName: string | null;
  coManagerEmail: string | null;
  members: MessMember[];
  requireJoinApproval: boolean;
  mealRevenuThisMonth: number | null;
  mealCollectionRate: number | null;
  sharedBillsTotalThisMonth: number | null;
  sharedBillsCollectionRate: number | null;
  sharedBillCategoriesCount: number | null;
  bookingRate: number | null;
}

export interface JoinRequest {
  id: string;
  memberId: string;
  memberName: string;
  memberEmail: string;
  messId: string;
  messName: string;
  status: "pending" | "approved" | "rejected" | "expired";
  createdAt: string;
}

export interface ProcurementRequest {
  id: string;
  messId: string;
  messName: string;
  managerId: string;
  managerName: string;
  description: string;
  status: "pending" | "approved" | "rejected";
  notes: string | null;
  createdAt: string;
}

export interface ReportRow {
  [key: string]: string | number | boolean | null;
}

export type ReportType =
  | "users"
  | "messes"
  | "financial"
  | "engagement"
  | "system_usage";
