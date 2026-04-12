import type { Role } from "~/enums/role.enum";

export interface Member {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: Role;
  messId: string;
  joinedAt: string;
  isActive: boolean;
}

export interface MemberState {
  members: Member[];
  currentMember: Member | null;
  isLoading: boolean;
  error: string | null;
}

export interface ItemAllocation {
  id: string;
  itemTypeId: string;
  itemTypeName: string;
  unit: string;
  date: string;
  quantity: number;
  memberId: string;
  messId: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  isRead: boolean;
  userId: string;
  createdAt: string;
}

export interface Feedback {
  id: string;
  subject: string;
  message: string;
  status: "pending" | "resolved";
  userId: string;
  userName: string;
  messId: string;
  createdAt: string;
}
