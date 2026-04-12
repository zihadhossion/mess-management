import type { BookingStatus } from "~/enums/booking-status.enum";

export type MealType = "breakfast" | "lunch" | "dinner";

export interface MealSlot {
  id: string;
  date: string;
  mealType: MealType;
  items: string;
  timeRange: string;
  isPublished: boolean;
  messId: string;
  bookingCount: number;
  myBookingId: string | null;
  myBookingStatus: BookingStatus | null;
  cancelDeadline: string | null;
}

export interface Booking {
  id: string;
  mealSlotId: string;
  userId: string;
  status: BookingStatus;
  createdAt: string;
}

export interface MenuState {
  slots: MealSlot[];
  isLoading: boolean;
  error: string | null;
}

export interface CreateMealSlotDto {
  date: string;
  mealType: MealType;
  items: string;
  timeRange: string;
  cancelDeadline?: string;
}
