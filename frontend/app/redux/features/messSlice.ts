import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { get } from "~/services/httpMethods/get";
import type { MessState, Mess, JoinRequest } from "~/types/mess.d";
import type { RootState } from "~/redux/store";

export const fetchMyMess = createAsyncThunk<Mess>(
  "mess/fetchMyMess",
  async (_, { rejectWithValue }) => {
    try {
      const res = await get<{ data: Mess }>("/messes/my");
      return res.data;
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        e.response?.data?.message ?? "Failed to fetch mess",
      );
    }
  },
);

export const fetchJoinRequests = createAsyncThunk<JoinRequest[]>(
  "mess/fetchJoinRequests",
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const messId = state.mess.mess?.id;
      if (!messId) return rejectWithValue("No mess found");
      const res = await get<{ data: JoinRequest[] }>(
        `/messes/${messId}/join-requests`,
      );
      return res.data;
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        e.response?.data?.message ?? "Failed to fetch join requests",
      );
    }
  },
);

const messSlice = createSlice({
  name: "mess",
  initialState: {
    mess: null,
    creationRequest: null,
    joinRequests: [],
    isLoading: false,
    error: null,
  } as MessState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyMess.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMyMess.fulfilled, (state, action) => {
        state.isLoading = false;
        state.mess = action.payload;
      })
      .addCase(fetchMyMess.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchJoinRequests.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchJoinRequests.fulfilled, (state, action) => {
        state.isLoading = false;
        state.joinRequests = action.payload;
      })
      .addCase(fetchJoinRequests.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export default messSlice.reducer;
