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

export const fetchAdminUsers = createAsyncThunk<AdminUser[]>(
  "admin/fetchUsers",
  async (_, { rejectWithValue }) => {
    try {
      const res = await get<{ data: { data: RawAdminUser[] } }>(
        "/users?limit=200",
      );
      return res.data.data.map(mapAdminUser);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        e.response?.data?.message ?? "Failed to fetch users",
      );
    }
  },
);

export const fetchAdminMesses = createAsyncThunk<AdminMess[]>(
  "admin/fetchMesses",
  async (_, { rejectWithValue }) => {
    try {
      const res = await get<{ data: AdminMess[] }>("/messes");
      return res.data;
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
      const res = await get<{ data: PlatformStats }>("/admin/stats");
      return res.data;
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
    messes: [],
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
        state.users = action.payload;
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
        state.messes = action.payload;
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
