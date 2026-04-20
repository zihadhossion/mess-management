import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { get } from "~/services/httpMethods/get";
import type { MenuState, MealSlot } from "~/types/menu.d";
import type { RootState } from "~/redux/store";

export const fetchMenuSlots = createAsyncThunk<
  MealSlot[],
  { startDate?: string; endDate?: string } | undefined
>("menu/fetchMenuSlots", async (params, { getState, rejectWithValue }) => {
  try {
    const state = getState() as RootState;
    const messId = state.mess.mess?.id;
    if (!messId) return rejectWithValue("No mess found");
    // Backend only accepts a single `date` param; for day view startDate === endDate
    const query = params?.startDate ? { date: params.startDate } : undefined;
    const res = await get<{ data: MealSlot[] }>(
      `/messes/${messId}/meal-slots`,
      query as Record<string, unknown>,
    );
    return res.data;
  } catch (err: unknown) {
    const e = err as { response?: { data?: { message?: string } } };
    return rejectWithValue(e.response?.data?.message ?? "Failed to fetch menu");
  }
});

const menuSlice = createSlice({
  name: "menu",
  initialState: {
    slots: [],
    isLoading: false,
    error: null,
  } as MenuState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMenuSlots.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMenuSlots.fulfilled, (state, action) => {
        state.isLoading = false;
        state.slots = action.payload;
      })
      .addCase(fetchMenuSlots.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export default menuSlice.reducer;
