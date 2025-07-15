import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define the state type
interface UiState {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  loading: {
    [key: string]: boolean;
  };
  notifications: Notification[];
  lastNotificationId: number;
}

interface Notification {
  id: number;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  title?: string;
  autoClose?: boolean;
  duration?: number;
}

// Initial state
const initialState: UiState = {
  theme: 'light',
  sidebarOpen: false,
  loading: {},
  notifications: [],
  lastNotificationId: 0
};

// Create the slice
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
      // Update document class for theme
      if (action.payload === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    setLoading: (state, action: PayloadAction<{ key: string; isLoading: boolean }>) => {
      state.loading[action.payload.key] = action.payload.isLoading;
    },
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id'>>) => {
      const id = state.lastNotificationId + 1;
      state.notifications.push({
        ...action.payload,
        id,
        autoClose: action.payload.autoClose !== false,
        duration: action.payload.duration || 5000
      });
      state.lastNotificationId = id;
    },
    removeNotification: (state, action: PayloadAction<number>) => {
      state.notifications = state.notifications.filter(
        notification => notification.id !== action.payload
      );
    },
    clearAllNotifications: (state) => {
      state.notifications = [];
    }
  }
});

// Export actions and reducer
export const {
  setTheme,
  toggleSidebar,
  setSidebarOpen,
  setLoading,
  addNotification,
  removeNotification,
  clearAllNotifications
} = uiSlice.actions;
export default uiSlice.reducer;
