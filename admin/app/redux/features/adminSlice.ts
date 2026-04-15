import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { get } from "~/services/httpMethods/get";
import type {
  AdminState,
  AdminUser,
  AdminMess,
  PlatformStats,
  MessCreationRequestAdmin,
} from "~/types/admin.d";
import { Role } from "~/enums/role.enum";

interface RawAdminUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
  isEmailVerified: boolean;
  isActive: boolean;
  messId?: string | null;
  messName?: string | null;
  createdAt: string;
}

function mapAdminUser(raw: RawAdminUser): AdminUser {
  return {
    id: raw.id,
    name: raw.fullName,
    email: raw.email,
    role: raw.role.toLowerCase() as Role,
    isEmailVerified: raw.isEmailVerified,
    isActive: raw.isActive,
    messId: raw.messId ?? null,
    messName: raw.messName ?? null,
    createdAt: raw.createdAt,
  };
}

export const fetchAdminUsers = createAsyncThunk<
  { users: AdminUser[]; total: number },
  { page: number; limit: number; role?: string; isActive?: string }
>(
  "admin/fetchUsers",
  async ({ page, limit, role, isActive }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (role) params.append("role", role.toUpperCase());
      if (isActive !== undefined) params.append("isActive", isActive);
      const res = await get<{ data: { data: RawAdminUser[]; total: number } }>(
        `/users?${params.toString()}`,
      );
      return {
        users: res.data.data.map(mapAdminUser),
        total: res.data.total,
      };
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        e.response?.data?.message ?? "Failed to fetch users",
      );
    }
  },
);

export const fetchAdminMesses = createAsyncThunk<
  { messes: AdminMess[]; total: number },
  { page: number; limit: number; status?: string }
>(
  "admin/fetchMesses",
  async ({ page, limit, status }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (status) params.append("status", status);
      const res = await get<{ data: { data: AdminMess[]; total: number } }>(
        `/messes?${params.toString()}`,
      );
      return {
        messes: res.data.data,
        total: res.data.total,
      };
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        e.response?.data?.message ?? "Failed to fetch messes",
      );
    }
  },
);

export const fetchPlatformStats = createAsyncThunk<PlatformStats>(
  "admin/fetchStats",
  async (_, { rejectWithValue }) => {
    try {
      const res = await get<{ data: any }>("/admin/stats");
      const d = res.data;
      return {
        totalUsers: d.users?.total ?? 0,
        totalMesses: d.messes?.total ?? 0,
        activeMembers: d.members?.total ?? 0,
        pendingRequests: d.pendingJoinRequests ?? 0,
        totalInvoicesThisMonth: 0,
        revenueThisMonth: 0,
      };
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        e.response?.data?.message ?? "Failed to fetch stats",
      );
    }
  },
);

export const fetchPendingMessRequests = createAsyncThunk<
  MessCreationRequestAdmin[]
>("admin/fetchPendingRequests", async (_, { rejectWithValue }) => {
  try {
    const res = await get<{ data: { data: MessCreationRequestAdmin[] } }>(
      "/messes/admin/pending",
    );
    return res.data.data;
  } catch (err: unknown) {
    const e = err as { response?: { data?: { message?: string } } };
    return rejectWithValue(
      e.response?.data?.message ?? "Failed to fetch requests",
    );
  }
});

interface ExtendedAdminState extends AdminState {
  stats: PlatformStats | null;
  pendingMessRequests: MessCreationRequestAdmin[];
}

const adminSlice = createSlice({
  name: "admin",
  initialState: {
    users: [],
    totalUsers: 0,
    messes: [],
    totalMesses: 0,
    stats: null,
    pendingRequests: 0,
    pendingMessRequests: [],
    isLoading: false,
    error: null,
  } as ExtendedAdminState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAdminUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload.users;
        state.totalUsers = action.payload.total;
      })
      .addCase(fetchAdminUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchAdminMesses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAdminMesses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.messes = action.payload.messes;
        state.totalMesses = action.payload.total;
      })
      .addCase(fetchAdminMesses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchPlatformStats.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchPlatformStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload;
      })
      .addCase(fetchPlatformStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchPendingMessRequests.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchPendingMessRequests.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pendingMessRequests = action.payload;
        state.pendingRequests = action.payload.length;
      })
      .addCase(fetchPendingMessRequests.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export default adminSlice.reducer;
