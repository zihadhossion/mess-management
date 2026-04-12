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

// Messes
export const getMesses = () => get<{ data: AdminMess[] }>("/messes");

// Stats
export const getPlatformStats = () =>
  get<{ data: PlatformStats }>("/admin/stats");

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
