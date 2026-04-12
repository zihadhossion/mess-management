import { createAsyncThunk } from "@reduxjs/toolkit";
import { get } from "~/services/httpMethods/get";
import { post as httpPost } from "~/services/httpMethods/post";
import { patch } from "~/services/httpMethods/patch";
import { del } from "~/services/httpMethods/delete";
import type { MealSlot, CreateMealSlotDto } from "~/types/menu.d";
import type { RootState } from "~/redux/store";

export const fetchMenuSlots = createAsyncThunk<
  MealSlot[],
  { startDate?: string; endDate?: string } | undefined
>("menu/fetchMenuSlots", async (params, { getState, rejectWithValue }) => {
  try {
    const state = getState() as RootState;
    const messId = state.mess.mess?.id;
    if (!messId) return rejectWithValue("No mess found");
    const res = await get<{ data: MealSlot[] }>(
      `/messes/${messId}/meal-slots`,
      params as Record<string, unknown>,
    );
    return res.data;
  } catch (err: unknown) {
    const error = err as { response?: { data?: { message?: string } } };
    return rejectWithValue(
      error.response?.data?.message ?? "Failed to fetch menu",
    );
  }
});

export async function bookMealSlot(
  messId: string,
  slotId: string,
): Promise<void> {
  await httpPost(`/messes/${messId}/bookings`, { slotId });
}

export async function cancelBooking(
  messId: string,
  bookingId: string,
): Promise<void> {
  await httpPost(`/messes/${messId}/bookings/${bookingId}/cancel`);
}

export async function restoreBooking(
  messId: string,
  bookingId: string,
): Promise<void> {
  await httpPost(`/messes/${messId}/bookings/${bookingId}/restore`);
}

export async function createMealSlot(
  messId: string,
  dto: CreateMealSlotDto,
): Promise<MealSlot> {
  const res = await httpPost<{ data: MealSlot }>(
    `/messes/${messId}/meal-slots`,
    dto,
  );
  return res.data;
}

export async function updateMealSlot(
  messId: string,
  slotId: string,
  dto: Partial<CreateMealSlotDto>,
): Promise<MealSlot> {
  const res = await patch<{ data: MealSlot }>(
    `/messes/${messId}/meal-slots/${slotId}`,
    dto,
  );
  return res.data;
}

export async function publishMealSlot(
  messId: string,
  slotId: string,
): Promise<void> {
  await patch(`/messes/${messId}/meal-slots/${slotId}/publish`);
}

export async function deleteMealSlot(
  messId: string,
  slotId: string,
): Promise<void> {
  await del(`/messes/${messId}/meal-slots/${slotId}`);
}
