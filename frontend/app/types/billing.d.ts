import type { InvoiceStatus } from "~/enums/invoice-status.enum";

export interface MealInvoice {
  id: string;
  monthlySummaryId: string;
  messMemberId: string;
  mealPortions: number;
  mealSubtotal: number;
  itemsSubtotal: number;
  fixedChargesSubtotal: number;
  totalAmount: number;
  paymentStatus: InvoiceStatus;
  pdfUrl: string | null;
  messMember?: { id: string; user: { id: string; name: string; email: string } };
  createdAt: string;
  // legacy fields kept for member-side views
  month?: string | number;
  year?: number;
  totalMeals?: number;
  grandTotal?: number;
  status?: InvoiceStatus;
}

export interface MonthlyBillSummary {
  id: string;
  messId: string;
  month: number;
  year: number;
  totalCost: number;
  totalPortions: number;
  costPerMeal: number;
  status: string;
  finalizedAt: string | null;
  createdAt: string;
}

export interface RecordMealPaymentDto {
  amount: number;
  method: string;
  paymentDate: string;
  referenceNote?: string;
}

export interface DailyCost {
  id: string;
  date: string;
  amount: number;
  description: string | null;
  messId: string;
  createdAt: string;
}

export interface FixedCharge {
  id: string;
  name: string;
  amount: number;
  isActive: boolean;
  messId: string;
}

export interface ItemType {
  id: string;
  name: string;
  unit: string;
  isActive: boolean;
  messId: string;
}

export interface BillingState {
  invoices: MealInvoice[];
  currentInvoice: MealInvoice | null;
  dailyCosts: DailyCost[];
  fixedCharges: FixedCharge[];
  itemTypes: ItemType[];
  isLoading: boolean;
  error: string | null;
}

export interface CreateDailyCostDto {
  date: string;
  amount: number;
  description: string;
}

export interface CreateFixedChargeDto {
  name: string;
  amount: number;
}

export interface CreateItemTypeDto {
  name: string;
  unit: string;
  defaultDailyQuantity: number;
  costPerUnit: number;
}
