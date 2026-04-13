import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { get } from "~/services/httpMethods/get";
import type {
  MemberState,
  Member,
  Notification,
  Feedback,
} from "~/types/member.d";
import type { RootState } from "~/redux/store";

export const fetchMembers = createAsyncThunk<Member[]>(
  "member/fetchMembers",
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const messId = state.mess.mess?.id;
      if (!messId) return rejectWithValue("No mess found");
      const res = await get<{ data: Member[] }>(`/messes/${messId}/members`);
      return res.data;
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        e.response?.data?.message ?? "Failed to fetch members",
      );
    }
  },
);

export const fetchNotifications = createAsyncThunk<Notification[]>(
  "member/fetchNotifications",
  async (_, { rejectWithValue }) => {
    try {
      const res = await get<{ data: Notification[]; total: number }>(
        "/notifications",
      );
      return res.data;
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        e.response?.data?.message ?? "Failed to fetch notifications",
      );
    }
  },
);

export const fetchFeedback = createAsyncThunk<Feedback[]>(
  "member/fetchFeedback",
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const messId = state.mess.mess?.id;
      if (!messId) return rejectWithValue("No mess found");
      const res = await get<{ data: Feedback[] }>(`/messes/${messId}/feedback`);
      return res.data;
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        e.response?.data?.message ?? "Failed to fetch feedback",
      );
    }
  },
);

interface ExtendedMemberState extends MemberState {
  notifications: Notification[];
  feedback: Feedback[];
}

const memberSlice = createSlice({
  name: "member",
  initialState: {
    members: [],
    currentMember: null,
    notifications: [],
    feedback: [],
    isLoading: false,
    error: null,
  } as ExtendedMemberState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMembers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMembers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.members = action.payload;
      })
      .addCase(fetchMembers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchNotifications.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notifications = action.payload;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchFeedback.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchFeedback.fulfilled, (state, action) => {
        state.isLoading = false;
        state.feedback = action.payload;
      })
      .addCase(fetchFeedback.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export default memberSlice.reducer;
