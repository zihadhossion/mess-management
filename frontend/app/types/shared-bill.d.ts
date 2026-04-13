import type { InvoiceStatus } from "~/enums/invoice-status.enum";

export interface SharedBillCategory {
  id: string;
  name: string;
  icon: string | null;
  messId: string;
  isActive: boolean;
}

export interface SharedBillEntry {
  id: string;
  categoryId: string;
  categoryName: string;
  amount: number;
  month: string;
  year: number;
  messId: string;
  note: string | null;
  createdAt: string;
}

export interface SharedBillInvoice {
  id: string;
  month: string;
  year: number;
  memberId: string;
  memberName: string;
  messId: string;
  totalAmount: number;
  perMemberShare: number;
  status: InvoiceStatus;
  entries: SharedBillEntry[];
  createdAt: string;
}

export interface CreateSharedBillEntryDto {
  categoryId: string;
  totalAmount: number;
  month: number;
  year: number;
  referenceNote?: string;
  entryDate: string;
}

export interface CreateSharedBillCategoryDto {
  name: string;
  icon?: string;
}
