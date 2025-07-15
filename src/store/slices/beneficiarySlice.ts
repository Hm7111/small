import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiClient } from '../../lib/api/apiClient';

// Types
export interface MemberData {
  id: string;
  user_id: string;
  full_name: string;
  national_id: string;
  phone: string;
  gender: 'male' | 'female';
  birth_date?: string;
  city: string;
  address?: string;
  email?: string;
  status: 'active' | 'inactive' | 'suspended';
  registration_status: string;
  profile_completion_percentage: number;
  disability_type?: string;
  disability_details?: string;
  disability_card_number?: string;
  education_level?: string;
  employment_status?: string;
  job_title?: string;
  employer?: string;
  monthly_income?: number;
  preferred_branch_id?: string;
  preferred_branch_name?: string;
}

export interface ServiceRequest {
  id: string;
  member_id: string;
  service_id: string;
  service_name: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  requested_amount?: number;
  approved_amount?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  processed_at?: string;
}

export interface AvailableService {
  id: string;
  name: string;
  description?: string;
  requirements?: string;
  category?: string;
  max_amount?: number;
  duration_days?: number;
  is_active: boolean;
  required_documents?: Array<{
    name: string;
    is_required: boolean;
  }>;
  reapplication_period_months?: number;
  is_one_time_only?: boolean;
  eligible?: boolean;
}

export interface MemberDocument {
  id: string;
  document_type: string;
  file_name: string;
  file_path: string;
  verification_status: 'pending' | 'verified' | 'rejected' | 'needs_replacement';
  is_required: boolean;
  uploaded_at: string;
  verified_at?: string;
  verification_notes?: string;
}

// State interface
interface BeneficiaryState {
  memberData: MemberData | null;
  services: AvailableService[];
  requests: ServiceRequest[];
  documents: MemberDocument[];
  registrationData: any;
  registrationStatus: string;
  completionPercentage: number;
  isLoading: {
    memberData: boolean;
    services: boolean;
    requests: boolean;
    documents: boolean;
    registration: boolean;
  };
  error: {
    memberData: string | null;
    services: string | null;
    requests: string | null;
    documents: string | null;
    registration: string | null;
  };
}

// Initial state
const initialState: BeneficiaryState = {
  memberData: null,
  services: [],
  requests: [],
  documents: [],
  registrationData: null,
  registrationStatus: 'profile_incomplete',
  completionPercentage: 0,
  isLoading: {
    memberData: false,
    services: false,
    requests: false,
    documents: false,
    registration: false
  },
  error: {
    memberData: null,
    services: null,
    requests: null,
    documents: null,
    registration: null
  }
};

// Async thunks
export const fetchMemberData = createAsyncThunk(
  'beneficiary/fetchMemberData',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await apiClient.callFunction<{ 
        memberData: MemberData 
      }>('get-member-data', { userId });
      
      return response.memberData;
    } catch (error: any) {
      return rejectWithValue(error.message || 'فشل في جلب بيانات المستفيد');
    }
  }
);

export const fetchAvailableServices = createAsyncThunk(
  'beneficiary/fetchAvailableServices',
  async (memberId: string, { rejectWithValue }) => {
    try {
      const response = await apiClient.callFunction<{ 
        services: AvailableService[] 
      }>('available-services', { memberId });
      
      return response.services || [];
    } catch (error: any) {
      return rejectWithValue(error.message || 'فشل في جلب الخدمات المتاحة');
    }
  }
);

export const fetchMemberRequests = createAsyncThunk(
  'beneficiary/fetchMemberRequests',
  async (memberId: string, { rejectWithValue }) => {
    try {
      const response = await apiClient.callFunction<{ 
        requests: ServiceRequest[] 
      }>('member-requests', { memberId });
      
      return response.requests || [];
    } catch (error: any) {
      return rejectWithValue(error.message || 'فشل في جلب طلبات المستفيد');
    }
  }
);

export const fetchMemberDocuments = createAsyncThunk(
  'beneficiary/fetchMemberDocuments',
  async (memberId: string, { rejectWithValue }) => {
    try {
      const response = await apiClient.callFunction<{ 
        documents: MemberDocument[] 
      }>('member-documents', { memberId });
      
      return response.documents || [];
    } catch (error: any) {
      return rejectWithValue(error.message || 'فشل في جلب مستندات المستفيد');
    }
  }
);

// Create the slice
const beneficiarySlice = createSlice({
  name: 'beneficiary',
  initialState,
  reducers: {
    resetBeneficiaryState: () => initialState,
    clearBeneficiaryErrors: (state) => {
      state.error = {
        memberData: null,
        services: null,
        requests: null,
        documents: null,
        registration: null
      };
    },
    setRegistrationStatus: (state, action: PayloadAction<string>) => {
      state.registrationStatus = action.payload;
    },
    setCompletionPercentage: (state, action: PayloadAction<number>) => {
      state.completionPercentage = action.payload;
    }
  },
  extraReducers: (builder) => {
    // Member Data
    builder.addCase(fetchMemberData.pending, (state) => {
      state.isLoading.memberData = true;
      state.error.memberData = null;
    });
    builder.addCase(fetchMemberData.fulfilled, (state, action) => {
      state.isLoading.memberData = false;
      state.memberData = action.payload;
      if (action.payload) {
        state.registrationStatus = action.payload.registration_status;
        state.completionPercentage = action.payload.profile_completion_percentage;
      }
    });
    builder.addCase(fetchMemberData.rejected, (state, action) => {
      state.isLoading.memberData = false;
      state.error.memberData = action.payload as string;
    });

    // Available Services
    builder.addCase(fetchAvailableServices.pending, (state) => {
      state.isLoading.services = true;
      state.error.services = null;
    });
    builder.addCase(fetchAvailableServices.fulfilled, (state, action) => {
      state.isLoading.services = false;
      state.services = action.payload;
    });
    builder.addCase(fetchAvailableServices.rejected, (state, action) => {
      state.isLoading.services = false;
      state.error.services = action.payload as string;
    });

    // Member Requests
    builder.addCase(fetchMemberRequests.pending, (state) => {
      state.isLoading.requests = true;
      state.error.requests = null;
    });
    builder.addCase(fetchMemberRequests.fulfilled, (state, action) => {
      state.isLoading.requests = false;
      state.requests = action.payload;
    });
    builder.addCase(fetchMemberRequests.rejected, (state, action) => {
      state.isLoading.requests = false;
      state.error.requests = action.payload as string;
    });

    // Member Documents
    builder.addCase(fetchMemberDocuments.pending, (state) => {
      state.isLoading.documents = true;
      state.error.documents = null;
    });
    builder.addCase(fetchMemberDocuments.fulfilled, (state, action) => {
      state.isLoading.documents = false;
      state.documents = action.payload;
    });
    builder.addCase(fetchMemberDocuments.rejected, (state, action) => {
      state.isLoading.documents = false;
      state.error.documents = action.payload as string;
    });
  }
});

// Export actions and reducer
export const { 
  resetBeneficiaryState, 
  clearBeneficiaryErrors,
  setRegistrationStatus,
  setCompletionPercentage
} = beneficiarySlice.actions;
export default beneficiarySlice.reducer;
