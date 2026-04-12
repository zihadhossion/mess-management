import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { get } from "~/services/httpMethods/get";
import type {
  BillingState,
  MealInvoice,
  DailyCost,
  FixedCharge,
  ItemType,
} from "~/types/billing.d";
import type { RootState } from "~/redux/store";

export const fetchMyInvoices = createAsyncThunk<MealInvoice[]>(
  "billing/fetchMyInvoices",
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const messId = state.mess.mess?.id;
      if (!messId) return rejectWithValue("No mess found");
      const res = await get<{ data: MealInvoice[] }>(
        `/messes/${messId}/billing/invoices`,
      );
      return res.data;
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        e.response?.data?.message ?? "Failed to fetch invoices",
      );
    }
  },
);

export const fetchDailyCosts = createAsyncThunk<
  DailyCost[],
  string | undefined
>("billing/fetchDailyCosts", async (month, { getState, rejectWithValue }) => {
  try {
    const state = getState() as RootState;
    const messId = state.mess.mess?.id;
    if (!messId) return rejectWithValue("No mess found");
    const res = await get<{ data: DailyCost[] }>(
      `/messes/${messId}/daily-costs`,
      month ? { month } : undefined,
    );
    return res.data;
  } catch (err: unknown) {
    const e = err as { response?: { data?: { message?: string } } };
    return rejectWithValue(
      e.response?.data?.message ?? "Failed to fetch daily costs",
    );
  }
});

export const fetchFixedCharges = createAsyncThunk<FixedCharge[]>(
  "billing/fetchFixedCharges",
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const messId = state.mess.mess?.id;
      if (!messId) return rejectWithValue("No mess found");
      const res = await get<{ data: FixedCharge[] }>(
        `/messes/${messId}/fixed-charges`,
      );
      return res.data;
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        e.response?.data?.message ?? "Failed to fetch fixed charges",
      );
    }
  },
);

export const fetchItemTypes = createAsyncThunk<ItemType[]>(
  "billing/fetchItemTypes",
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const messId = state.mess.mess?.id;
      if (!messId) return rejectWithValue("No mess found");
      const res = await get<{ data: ItemType[] }>(
        `/messes/${messId}/item-types`,
      );
      return res.data;
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        e.response?.data?.message ?? "Failed to fetch item types",
      );
    }
  },
);

const billingSlice = createSlice({
  name: "billing",
  initialState: {
    invoices: [],
    currentInvoice: null,
    dailyCosts: [],
    fixedCharges: [],
    itemTypes: [],
    isLoading: false,
    error: null,
  } as BillingState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyInvoices.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMyInvoices.fulfilled, (state, action) => {
        state.isLoading = false;
        state.invoices = action.payload;
      })
      .addCase(fetchMyInvoices.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchDailyCosts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDailyCosts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.dailyCosts = action.payload;
      })
      .addCase(fetchDailyCosts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchFixedCharges.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFixedCharges.fulfilled, (state, action) => {
        state.isLoading = false;
        state.fixedCharges = action.payload;
      })
      .addCase(fetchFixedCharges.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchItemTypes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchItemTypes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.itemTypes = action.payload;
      })
      .addCase(fetchItemTypes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export default billingSlice.reducer;
