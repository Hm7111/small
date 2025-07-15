import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authService } from '../../features/auth/services/authService';
import { User, OtpVerificationResponse } from '../../core/types/auth';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isInitialized: boolean;
  error: string | null;
  otpSession: {
    nationalId: string;
    sessionId: number;
    isNewUser: boolean;
  } | null;
}

const initialState: AuthState = {
  user: null,
  isLoading: false,
  isAuthenticated: false,
  isInitialized: false,
  error: null,
  otpSession: null,
};

// Async thunks
export const initAuth = createAsyncThunk(
  'auth/initAuth',
  async () => {
    try {
      const user = authService.getUserFromStorage();
      return user;
    } catch (error) {
      console.error('Error initializing auth:', error);
      return null;
    }
  }
);

export const sendOtp = createAsyncThunk(
  'auth/sendOtp',
  async (data: { nationalId: string; phoneNumber: string; fullName?: string }) => {
    const response = await authService.sendOtp(data.nationalId, data.phoneNumber, data.fullName);
    if (!response.success) {
      throw new Error(response.error);
    }
    return response;
  }
);

export const sendExistingUserOtp = createAsyncThunk(
  'auth/sendExistingUserOtp',
  async (nationalId: string) => {
    const response = await authService.sendExistingUserOtp(nationalId);
    if (!response.success) {
      throw new Error(response.error);
    }
    return response;
  }
);

export const verifyOtp = createAsyncThunk(
  'auth/verifyOtp',
  async (data: { nationalId: string; otp: string; sessionId?: number }) => {
    const response = await authService.verifyOtp(data.nationalId, data.otp, data.sessionId);
    if (!response.success) {
      throw new Error(response.error);
    }
    return response;
  }
);

export const verifyExistingUserOtp = createAsyncThunk(
  'auth/verifyExistingUserOtp',
  async (data: { nationalId: string; otp: string; sessionId?: number }) => {
    const response = await authService.verifyExistingUserOtp(data.nationalId, data.otp, data.sessionId);
    if (!response.success) {
      throw new Error(response.error);
    }
    return response;
  }
);

export const loginWithEmail = createAsyncThunk(
  'auth/loginWithEmail',
  async (data: { email: string; password: string }) => {
    const response = await authService.loginWithEmail(data.email, data.password);
    if (!response.success) {
      throw new Error(response.error);
    }
    return response.data;
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async () => {
    await authService.logout();
    // إضافة إزالة البيانات من localStorage مباشرة هنا أيضًا
    localStorage.removeItem('user');
    localStorage.removeItem('supabase.auth.token');
    sessionStorage.clear();
  }
);

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
    },
    setOtpSession: (state, action: PayloadAction<AuthState['otpSession']>) => {
      state.otpSession = action.payload;
    },
    clearOtpSession: (state) => {
      state.otpSession = null;
    },
    clearUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.otpSession = null;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Initialize Auth
      .addCase(initAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(initAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isInitialized = true;
        if (action.payload) {
          state.user = action.payload;
          state.isAuthenticated = true;
        }
      })
      .addCase(initAuth.rejected, (state) => {
        state.isLoading = false;
        state.isInitialized = true;
        state.isAuthenticated = false;
      })
      
      // Send OTP
      .addCase(sendOtp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendOtp.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.data) {
          state.otpSession = {
            nationalId: action.payload.data.nationalId,
            sessionId: action.payload.data.sessionId,
            isNewUser: action.payload.data.isNewUser,
          };
        }
      })
      .addCase(sendOtp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'خطأ في إرسال رمز التحقق';
      })
      
      // Send Existing User OTP
      .addCase(sendExistingUserOtp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendExistingUserOtp.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.data) {
          state.otpSession = {
            nationalId: action.payload.data.nationalId,
            sessionId: action.payload.data.sessionId,
            isNewUser: false,
          };
        }
      })
      .addCase(sendExistingUserOtp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'خطأ في إرسال رمز التحقق';
      })
      
      // Verify OTP
      .addCase(verifyOtp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.user) {
          state.user = action.payload.user;
          state.isAuthenticated = true;
          authService.saveUserToStorage(action.payload.user);
        }
        state.otpSession = null;
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'خطأ في التحقق من رمز التحقق';
      })
      
      // Verify Existing User OTP
      .addCase(verifyExistingUserOtp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyExistingUserOtp.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.user) {
          state.user = action.payload.user;
          state.isAuthenticated = true;
          authService.saveUserToStorage(action.payload.user);
        }
        state.otpSession = null;
      })
      .addCase(verifyExistingUserOtp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'خطأ في التحقق من رمز التحقق';
      })
      
      // Login with Email
      .addCase(loginWithEmail.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginWithEmail.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        authService.saveUserToStorage(action.payload);
      })
      .addCase(loginWithEmail.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'خطأ في تسجيل الدخول';
      })
      
      // Logout
      .addCase(logout.fulfilled, (state) => {
        console.log('Logging out user from Redux state');
        state.user = null;
        state.isAuthenticated = false;
        state.otpSession = null;
        state.error = null;
        
        // محاولة إزالة البيانات من localStorage
        try {
          localStorage.removeItem('user');
          localStorage.removeItem('supabase.auth.token');
        } catch (e) {
          console.error('Failed to clear localStorage during logout:', e);
        }
      });
  },
});

export const { clearError, setUser, setOtpSession, clearOtpSession, clearUser, setLoading } = authSlice.actions;
export default authSlice.reducer;
