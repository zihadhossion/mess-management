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
  totalAmount: number;
  month: number;
  year: number;
  messId: string;
  referenceNote: string | null;
  note: string | null;
  createdAt: string;
  category?: { id: string; name: string };
}

export interface SharedBillInvoiceMember {
  id: string;
  user: { id: string; name: string; email: string };
}

export interface SharedBillInvoice {
  id: string;
  month: number;
  year: number;
  messMemberId: string;
  messId: string;
  totalShare: number;
  activeMemberCount: number;
  paymentStatus: InvoiceStatus;
  status: string;
  pdfUrl: string | null;
  messMember?: SharedBillInvoiceMember;
  payments?: SharedBillPayment[];
  createdAt: string;
}

export interface SharedBillPayment {
  id: string;
  sharedBillInvoiceId: string;
  amount: number;
  method: string;
  paymentDate: string;
  referenceNote: string | null;
  recordedById: string;
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
  description?: string;
}

export interface RecordSharedBillPaymentDto {
  amount: number;
  method: string;
  paymentDate: string;
  referenceNote?: string;
}
