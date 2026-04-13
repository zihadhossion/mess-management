import type { InvoiceStatus } from "~/enums/invoice-status.enum";

export interface MealInvoice {
  id: string;
  month: string;
  year: number;
  memberId: string;
  memberName: string;
  messId: string;
  totalMeals: number;
  totalCost: number;
  fixedCharges: number;
  grandTotal: number;
  status: InvoiceStatus;
  breakdown: MealInvoiceBreakdown[];
  createdAt: string;
}

export interface MealInvoiceBreakdown {
  date: string;
  mealType: string;
  cost: number;
  portions: number;
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
