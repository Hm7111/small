import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage/session'; // Use sessionStorage for security
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';
import adminReducer from './slices/adminSlice';
import branchReducer from './slices/branchSlice';
import beneficiaryReducer from './slices/beneficiarySlice';
import errorReducer from './slices/errorSlice';

// Root reducer with all slices
const rootReducer = combineReducers({
  auth: authReducer,
  ui: uiReducer,
  admin: adminReducer,
  branch: branchReducer,
  beneficiary: beneficiaryReducer,
  error: errorReducer
});

// Persist configuration
const persistConfig = {
  key: 'gov-app-root',
  storage,
  whitelist: ['auth', 'ui'], // Only persist these slices
  blacklist: ['error'], // Never persist these slices
};

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store with middleware
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

// Create persistor
export const persistor = persistStore(store);

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
