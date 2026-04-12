import type { MessStatus } from "~/enums/mess-status.enum";

export interface Mess {
  id: string;
  name: string;
  code: string;
  description: string | null;
  address: string | null;
  currency: string;
  status: MessStatus;
  managerId: string;
  managerName: string;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface MessCreationRequest {
  id: string;
  messName: string;
  description: string | null;
  address: string | null;
  currency: string;
  status: MessStatus;
  managerId: string;
  managerName: string;
  reviewNote: string | null;
  createdAt: string;
}

export interface MessState {
  mess: Mess | null;
  creationRequest: MessCreationRequest | null;
  joinRequests: JoinRequest[];
  isLoading: boolean;
  error: string | null;
}

export interface CreateMessDto {
  messName: string;
  description?: string;
  address?: string;
  currency: string;
}

export interface JoinMessDto {
  messId: string;
}

export interface JoinRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  messId: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}
