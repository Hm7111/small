import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiClient } from '../../lib/api/apiClient';

// Types
export interface AdminStats {
  totalUsers: number;
  totalMembers: number;
  pendingRequests: number;
  activeBranches: number;
  totalServices: number;
  systemHealth: 'excellent' | 'good' | 'warning' | 'critical';
}

export interface User {
  id: string;
  full_name: string;
  email?: string;
  national_id?: string;
  phone: string;
  role: 'admin' | 'branch_manager' | 'employee' | 'beneficiary';
  branch_id?: string;
  branch_name?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Branch {
  id: string;
  name: string;
  city: string;
  address?: string;
  phone?: string;
  manager_id?: string;
  manager_name?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  employees_count?: number;
  members_count?: number;
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  requirements?: string;
  category?: string;
  max_amount?: number;
  duration_days?: number;
  created_by?: string;
  creator_name?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  requests_count?: number;
  required_documents?: Array<{
    name: string;
    is_required: boolean;
  }>;
  reapplication_period_months?: number;
  is_one_time_only?: boolean;
}

// State interface
interface AdminState {
  stats: AdminStats | null;
  users: User[];
  branches: Branch[];
  services: Service[];
  isLoading: {
    stats: boolean;
    users: boolean;
    branches: boolean;
    services: boolean;
  };
  error: {
    stats: string | null;
    users: string | null;
    branches: string | null;
    services: string | null;
  };
}

// Initial state
const initialState: AdminState = {
  stats: null,
  users: [],
  branches: [],
  services: [],
  isLoading: {
    stats: false,
    users: false,
    branches: false,
    services: false
  },
  error: {
    stats: null,
    users: null,
    branches: null,
    services: null
  }
};

// Async thunks
export const fetchAdminStats = createAsyncThunk(
  'admin/fetchStats',
  async (adminId: string, { rejectWithValue }) => {
    try {
      const response = await apiClient.callFunction<{ stats: AdminStats }>('admin-stats', { adminId });
      return response.stats;
    } catch (error: any) {
      return rejectWithValue(error.message || 'فشل في جلب الإحصائيات');
    }
  }
);

export const fetchUsers = createAsyncThunk(
  'admin/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.callFunction<{ users: User[] }>('admin-users', { action: 'list' });
      return response.users || [];
    } catch (error: any) {
      return rejectWithValue(error.message || 'فشل في جلب المستخدمين');
    }
  }
);

export const toggleUserStatus = createAsyncThunk(
  'admin/toggleUserStatus',
  async ({ userId, newStatus }: { userId: string; newStatus: boolean }, { rejectWithValue }) => {
    try {
      const response = await apiClient.callFunction<{ user: User }>('admin-users', {
        action: 'toggle_status',
        userId,
        newStatus
      });
      return response.user;
    } catch (error: any) {
      return rejectWithValue(error.message || 'فشل في تغيير حالة المستخدم');
    }
  }
);

export const fetchBranches = createAsyncThunk(
  'admin/fetchBranches',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.callFunction<{ branches: Branch[] }>('admin-branches', { action: 'list' });
      return response.branches || [];
    } catch (error: any) {
      return rejectWithValue(error.message || 'فشل في جلب الفروع');
    }
  }
);

export const toggleBranchStatus = createAsyncThunk(
  'admin/toggleBranchStatus',
  async ({ branchId, newStatus }: { branchId: string; newStatus: boolean }, { rejectWithValue }) => {
    try {
      const response = await apiClient.callFunction<{ branch: Branch }>('admin-branches', {
        action: 'toggle_status',
        branchId,
        newStatus
      });
      return response.branch;
    } catch (error: any) {
      return rejectWithValue(error.message || 'فشل في تغيير حالة الفرع');
    }
  }
);

export const fetchServices = createAsyncThunk(
  'admin/fetchServices',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.callFunction<{ services: Service[] }>('admin-services', { action: 'list' });
      return response.services || [];
    } catch (error: any) {
      return rejectWithValue(error.message || 'فشل في جلب الخدمات');
    }
  }
);

export const toggleServiceStatus = createAsyncThunk(
  'admin/toggleServiceStatus',
  async ({ serviceId, newStatus }: { serviceId: string; newStatus: boolean }, { rejectWithValue }) => {
    try {
      const response = await apiClient.callFunction<{ service: Service }>('admin-services', {
        action: 'toggle_status',
        serviceId,
        newStatus
      });
      return response.service;
    } catch (error: any) {
      return rejectWithValue(error.message || 'فشل في تغيير حالة الخدمة');
    }
  }
);

// Create the slice
const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    resetAdminState: () => initialState,
    clearAdminErrors: (state) => {
      state.error = {
        stats: null,
        users: null,
        branches: null,
        services: null
      };
    }
  },
  extraReducers: (builder) => {
    // Stats
    builder.addCase(fetchAdminStats.pending, (state) => {
      state.isLoading.stats = true;
      state.error.stats = null;
    });
    builder.addCase(fetchAdminStats.fulfilled, (state, action) => {
      state.isLoading.stats = false;
      state.stats = action.payload;
    });
    builder.addCase(fetchAdminStats.rejected, (state, action) => {
      state.isLoading.stats = false;
      state.error.stats = action.payload as string;
    });

    // Users
    builder.addCase(fetchUsers.pending, (state) => {
      state.isLoading.users = true;
      state.error.users = null;
    });
    builder.addCase(fetchUsers.fulfilled, (state, action) => {
      state.isLoading.users = false;
      state.users = action.payload;
    });
    builder.addCase(fetchUsers.rejected, (state, action) => {
      state.isLoading.users = false;
      state.error.users = action.payload as string;
    });

    // Toggle user status
    builder.addCase(toggleUserStatus.fulfilled, (state, action) => {
      const updatedUser = action.payload;
      state.users = state.users.map(user => 
        user.id === updatedUser.id ? updatedUser : user
      );
    });

    // Branches
    builder.addCase(fetchBranches.pending, (state) => {
      state.isLoading.branches = true;
      state.error.branches = null;
    });
    builder.addCase(fetchBranches.fulfilled, (state, action) => {
      state.isLoading.branches = false;
      state.branches = action.payload;
    });
    builder.addCase(fetchBranches.rejected, (state, action) => {
      state.isLoading.branches = false;
      state.error.branches = action.payload as string;
    });

    // Toggle branch status
    builder.addCase(toggleBranchStatus.fulfilled, (state, action) => {
      const updatedBranch = action.payload;
      state.branches = state.branches.map(branch => 
        branch.id === updatedBranch.id ? updatedBranch : branch
      );
    });

    // Services
    builder.addCase(fetchServices.pending, (state) => {
      state.isLoading.services = true;
      state.error.services = null;
    });
    builder.addCase(fetchServices.fulfilled, (state, action) => {
      state.isLoading.services = false;
      state.services = action.payload;
    });
    builder.addCase(fetchServices.rejected, (state, action) => {
      state.isLoading.services = false;
      state.error.services = action.payload as string;
    });

    // Toggle service status
    builder.addCase(toggleServiceStatus.fulfilled, (state, action) => {
      const updatedService = action.payload;
      state.services = state.services.map(service => 
        service.id === updatedService.id ? updatedService : service
      );
    });
  }
});

// Export actions and reducer
export const { resetAdminState, clearAdminErrors } = adminSlice.actions;
export default adminSlice.reducer;
