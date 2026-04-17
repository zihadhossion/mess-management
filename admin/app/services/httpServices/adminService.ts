import { get } from "~/services/httpMethods/get";
import { post } from "~/services/httpMethods/post";
import { put } from "~/services/httpMethods/put";
import { patch } from "~/services/httpMethods/patch";
import { del } from "~/services/httpMethods/delete";
import type {
  AdminUser,
  AdminMess,
  PlatformStats,
  MessCreationRequestAdmin,
  MessDeletionRequest,
  AdminConfig,
  JoinRequest,
  ProcurementRequest,
  ReportRow,
  ReportType,
  MessDetail,
  TrendPoint,
  RecentActivity,
  LoginHistoryEntry,
  EmailTemplate,
} from "~/types/admin.d";

// Users
export const getUsers = () => get<{ data: AdminUser[] }>("/users");
export const getUserById = (id: string) =>
  get<{ data: AdminUser }>(`/users/${id}`);
export const updateUserRole = (id: string, role: string) =>
  patch<void>(`/users/${id}`, { role });
export const activateUser = (id: string) => post<void>(`/users/${id}/activate`);
export const suspendUser = (id: string) => post<void>(`/users/${id}/suspend`);
export const banUser = (id: string) => post<void>(`/users/${id}/ban`);
export const resetUserPassword = (id: string) =>
  post<void>(`/users/${id}/reset-password`);
export const deleteUser = (id: string) => del<void>(`/users/${id}`);
export const forceVerifyEmail = (id: string) =>
  post<void>(`/users/${id}/verify-email`);
export const mergeAccounts = (id: string, duplicateId: string) =>
  post<void>(`/admin/users/${id}/merge`, { duplicateId });
export const getUserLoginHistory = (id: string) =>
  get<{ data: LoginHistoryEntry[] }>(`/admin/users/${id}/login-history`);
export const createUser = (data: { name: string; email: string; role: string }) =>
  post<void>("/admin/users", data);

// Messes
export const getMesses = () => get<{ data: AdminMess[] }>("/messes");
export const getMessDetail = (id: string) =>
  get<{ data: MessDetail }>(`/admin/messes/${id}`);
export const forceDeactivateMess = (id: string) =>
  post<void>(`/admin/messes/${id}/deactivate`);
export const reassignMessManager = (id: string, newManagerId: string) =>
  post<void>(`/admin/messes/${id}/reassign-manager`, { newManagerId });

// Stats
export const getPlatformStats = (period?: string) =>
  get<{ data: PlatformStats }>(`/admin/stats${period ? `?period=${period}` : ""}`);
export const getUserGrowth = (period: string) =>
  get<{ data: TrendPoint[] }>(`/admin/stats/user-growth?period=${period}`);
export const getMessTrend = (period: string) =>
  get<{ data: TrendPoint[] }>(`/admin/stats/mess-trend?period=${period}`);
export const getRecentActivity = () =>
  get<{ data: RecentActivity[] }>("/admin/recent-activity");

// Mess creation requests
export const getPendingMessRequests = () =>
  get<{ data: MessCreationRequestAdmin[] }>("/messes/admin/pending");
export const approveMessRequest = (id: string) =>
  post<void>(`/messes/${id}/approve`);
export const rejectMessRequest = (id: string, reviewNote: string) =>
  post<void>(`/messes/${id}/reject`, { reviewNote });

// Deletion requests
export const getDeletionRequests = () =>
  get<{ data: { data: MessDeletionRequest[]; total: number } }>("/admin/deletion-requests");
export const approveDeletionRequest = (id: string) =>
  post<void>(`/admin/deletion-requests/${id}/approve`);
export const rejectDeletionRequest = (id: string) =>
  post<void>(`/admin/deletion-requests/${id}/reject`);

// Config
export const getAdminConfig = () => get<{ data: AdminConfig }>("/admin/config");
export const updateAdminConfig = (config: AdminConfig) =>
  put<void>("/admin/config", config);

// Email templates
export const getEmailTemplates = () =>
  get<{ data: EmailTemplate[] }>("/admin/email-templates");
export const updateEmailTemplate = (id: string, data: { subject: string; body: string }) =>
  put<void>(`/admin/email-templates/${id}`, data);

// Currency management
export const getSupportedCurrencies = () =>
  get<{ data: string[] }>("/admin/currencies");
export const updateSupportedCurrencies = (currencies: string[]) =>
  put<void>("/admin/currencies", { currencies });

// Mess creation requests (all statuses)
export const getMessRequests = (params?: { status?: string; from?: string; to?: string }) => {
  const q = new URLSearchParams();
  if (params?.status) q.set("status", params.status);
  if (params?.from) q.set("from", params.from);
  if (params?.to) q.set("to", params.to);
  const qs = q.toString();
  return get<{ data: MessCreationRequestAdmin[] }>(`/messes/admin/requests${qs ? `?${qs}` : ""}`);
};

// Join requests (read-only oversight)
export const getJoinRequests = (params?: {
  status?: string;
  messId?: string;
  from?: string;
  to?: string;
}) => {
  const query = new URLSearchParams();
  if (params?.status) query.set("status", params.status);
  if (params?.messId) query.set("messId", params.messId);
  if (params?.from) query.set("from", params.from);
  if (params?.to) query.set("to", params.to);
  const qs = query.toString();
  return get<{ data: { data: JoinRequest[]; total: number } }>(
    `/admin/join-requests${qs ? `?${qs}` : ""}`,
  );
};

// Procurement requests
export const getProcurementRequests = (params?: { status?: string; messId?: string }) => {
  const query = new URLSearchParams();
  if (params?.status) query.set("status", params.status);
  if (params?.messId) query.set("messId", params.messId);
  const qs = query.toString();
  return get<{ data: { data: ProcurementRequest[]; total: number } }>(
    `/admin/procurement-requests${qs ? `?${qs}` : ""}`,
  );
};
export const approveProcurementRequest = (id: string) =>
  post<void>(`/admin/procurement-requests/${id}/approve`);
export const rejectProcurementRequest = (id: string, notes?: string) =>
  post<void>(`/admin/procurement-requests/${id}/reject`, { notes });

// Reports
export const generateReport = (params: {
  type: ReportType;
  from: string;
  to: string;
  [key: string]: string;
}) => {
  const query = new URLSearchParams(params as Record<string, string>);
  return get<{ data: { columns: string[]; rows: ReportRow[] } }>(
    `/admin/reports?${query.toString()}`,
  );
};
