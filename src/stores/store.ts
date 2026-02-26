import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from './storage';
import { AuthAPI } from './services/AuthApi';
import { OrganizerAPI } from './services/OrganizerApi';
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';
import { CategoryAPI } from './services/CategoryApi';
import { EventAPI } from './services/EventApi';
import { VenueAPI } from './services/VenueApi';
import { TicketTypeAPI } from './services/TicketTypeApi';
import { OrganizationMemberAPI } from './services/OrganizationMemberApi';
import { OrderAPI } from './services/OrderApi';
import { PaymentAPI } from './services/PaymentApi';

// Redux Persist configuration for auth slice
// Security: Only persist user info, NOT accessToken (stored in memory only)
// Refresh token is stored in httpOnly cookie by backend
const persistConfig = {
  key: 'auth',
  storage,
  whitelist: ['user'], // Only persist user data, accessToken lives in memory
  // accessToken will be refreshed from httpOnly cookie on app init
};

const persistedAuthReducer = persistReducer(persistConfig, authReducer);

// UI state persist config - chỉ persist user preferences
const uiPersistConfig = {
  key: 'ui',
  storage,
  whitelist: ['sidebarOpen'], // Chỉ lưu sidebar preference
};

const persistedUiReducer = persistReducer(uiPersistConfig, uiReducer);

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    ui: persistedUiReducer, // UI state slice
    [AuthAPI.reducerPath]: AuthAPI.reducer,
    [OrganizerAPI.reducerPath]: OrganizerAPI.reducer,
    [CategoryAPI.reducerPath]: CategoryAPI.reducer,
    [EventAPI.reducerPath]: EventAPI.reducer,
    [VenueAPI.reducerPath]: VenueAPI.reducer,
    [TicketTypeAPI.reducerPath]: TicketTypeAPI.reducer,
    [OrganizationMemberAPI.reducerPath]: OrganizationMemberAPI.reducer,
    [OrderAPI.reducerPath]: OrderAPI.reducer,
    [PaymentAPI.reducerPath]: PaymentAPI.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    })
      .concat(AuthAPI.middleware)
      .concat(OrganizerAPI.middleware)
      .concat(CategoryAPI.middleware)
      .concat(EventAPI.middleware)
      .concat(VenueAPI.middleware)
      .concat(TicketTypeAPI.middleware)
      .concat(OrganizationMemberAPI.middleware)
      .concat(OrderAPI.middleware)
      .concat(PaymentAPI.middleware),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
