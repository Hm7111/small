import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define error types
export interface AppError {
  id: string;
  message: string;
  code?: string;
  timestamp: number;
  context?: string;
  handled: boolean;
  severity: 'critical' | 'error' | 'warning' | 'info';
  componentStack?: string;
}

// Define the state type
interface ErrorState {
  errors: AppError[];
  lastErrorId: number;
}

// Initial state
const initialState: ErrorState = {
  errors: [],
  lastErrorId: 0
};

// Create the slice
const errorSlice = createSlice({
  name: 'error',
  initialState,
  reducers: {
    addError: (state, action: PayloadAction<Omit<AppError, 'id' | 'timestamp' | 'handled'>>) => {
      const id = `error-${state.lastErrorId + 1}`;
      state.errors.push({
        ...action.payload,
        id,
        timestamp: Date.now(),
        handled: false
      });
      state.lastErrorId += 1;
      
      // Log to console in development
      if (process.env.NODE_ENV !== 'production') {
        console.error(`[ERROR ${id}]`, action.payload.message, action.payload);
      }
    },
    markErrorAsHandled: (state, action: PayloadAction<string>) => {
      const error = state.errors.find(e => e.id === action.payload);
      if (error) {
        error.handled = true;
      }
    },
    clearError: (state, action: PayloadAction<string>) => {
      state.errors = state.errors.filter(error => error.id !== action.payload);
    },
    clearAllErrors: (state) => {
      state.errors = [];
    }
  }
});

// Export actions and reducer
export const { addError, markErrorAsHandled, clearError, clearAllErrors } = errorSlice.actions;
export default errorSlice.reducer;
