import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiClient } from '../../lib/api/apiClient';

// Types
export interface BranchStats {
  pendingRegistrations: number;
  totalMembers: number;
  activeRequests: number;
  employeesCount: number;
  reviewTime: string;
  branchRank: number;
}

export interface BranchData {
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
}

export interface BranchEmployee {
  id: string;
  full_name: string;
  email?: string;
  phone: string;
  role: 'branch_manager' | 'employee';
  is_active: boolean;
  branch_id: string;
  created_at: string;
  updated_at: string;
  registered_members_count?: number;
  pending_tasks?: number;
}

export interface BranchMember {
  id: string;
  full_name: string;
  national_id: string;
  phone: string;
  gender: 'male' | 'female';
  city: string;
  disability_type?: string;
  email?: string;
  created_at: string;
  updated_at: string;
  status: 'active' | 'inactive' | 'suspended';
  registration_status: string;
}

// State interface
interface BranchState {
  branchData: BranchData | null;
  stats: BranchStats | null;
  employees: BranchEmployee[];
  members: BranchMember[];
  registrations: any[];
  requests: any[];
  isLoading: {
    dashboard: boolean;
    employees: boolean;
    members: boolean;
    registrations: boolean;
    requests: boolean;
  };
  error: {
    dashboard: string | null;
    employees: string | null;
    members: string | null;
    registrations: string | null;
    requests: string | null;
  };
}

// Initial state
const initialState: BranchState = {
  branchData: null,
  stats: null,
  employees: [],
  members: [],
  registrations: [],
  requests: [],
  isLoading: {
    dashboard: false,
    employees: false,
    members: false,
    registrations: false,
    requests: false
  },
  error: {
    dashboard: null,
    employees: null,
    members: null,
    registrations: null,
    requests: null
  }
};

// Async thunks
export const fetchBranchDashboard = createAsyncThunk(
  'branch/fetchDashboard',
  async ({ managerId, branchId }: { managerId: string; branchId: string }, { rejectWithValue }) => {
    try {
      const response = await apiClient.callFunction<{ 
        branchData: BranchData; 
        stats: BranchStats 
      }>('branch-manager', { 
        action: 'get_dashboard', 
        managerId, 
        branchId 
      });
      
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'فشل في جلب بيانات لوحة التحكم');
    }
  }
);

export const fetchBranchEmployees = createAsyncThunk(
  'branch/fetchEmployees',
  async (branchId: string, { rejectWithValue }) => {
    try {
      const response = await apiClient.callFunction<{ 
        employees: BranchEmployee[];
      }>('branch-employees', { 
        action: 'list',
        branchId 
      });
      
      return response.employees || [];
    } catch (error: any) {
      return rejectWithValue(error.message || 'فشل في جلب بيانات الموظفين');
    }
  }
);

export const fetchBranchMembers = createAsyncThunk(
  'branch/fetchMembers',
  async (branchId: string, { rejectWithValue }) => {
    try {
      const response = await apiClient.callFunction<{ 
        members: BranchMember[];
      }>('branch-members', { 
        action: 'list',
        branchId 
      });
      
      return response.members || [];
    } catch (error: any) {
      return rejectWithValue(error.message || 'فشل في جلب بيانات المستفيدين');
    }
  }
);

// Create the slice
const branchSlice = createSlice({
  name: 'branch',
  initialState,
  reducers: {
    resetBranchState: () => initialState,
    clearBranchErrors: (state) => {
      state.error = {
        dashboard: null,
        employees: null,
        members: null,
        registrations: null,
        requests: null
      };
    }
  },
  extraReducers: (builder) => {
    // Dashboard
    builder.addCase(fetchBranchDashboard.pending, (state) => {
      state.isLoading.dashboard = true;
      state.error.dashboard = null;
    });
    builder.addCase(fetchBranchDashboard.fulfilled, (state, action) => {
      state.isLoading.dashboard = false;
      state.branchData = action.payload.branchData;
      state.stats = action.payload.stats;
    });
    builder.addCase(fetchBranchDashboard.rejected, (state, action) => {
      state.isLoading.dashboard = false;
      state.error.dashboard = action.payload as string;
    });

    // Employees
    builder.addCase(fetchBranchEmployees.pending, (state) => {
      state.isLoading.employees = true;
      state.error.employees = null;
    });
    builder.addCase(fetchBranchEmployees.fulfilled, (state, action) => {
      state.isLoading.employees = false;
      state.employees = action.payload;
    });
    builder.addCase(fetchBranchEmployees.rejected, (state, action) => {
      state.isLoading.employees = false;
      state.error.employees = action.payload as string;
    });

    // Members
    builder.addCase(fetchBranchMembers.pending, (state) => {
      state.isLoading.members = true;
      state.error.members = null;
    });
    builder.addCase(fetchBranchMembers.fulfilled, (state, action) => {
      state.isLoading.members = false;
      state.members = action.payload;
    });
    builder.addCase(fetchBranchMembers.rejected, (state, action) => {
      state.isLoading.members = false;
      state.error.members = action.payload as string;
    });
  }
});

// Export actions and reducer
export const { resetBranchState, clearBranchErrors } = branchSlice.actions;
export default branchSlice.reducer;
