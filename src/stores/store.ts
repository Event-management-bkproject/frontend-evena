import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from './storage';
import { AuthAPI } from './services/AuthApi';
import { OrganizerAPI } from './services/OrganizerApi';
import authReducer, { AuthState } from './slices/authSlice';
import uiReducer from './slices/uiSlice';
import { CategoryAPI } from './services/CategoryApi';
import { EventAPI } from './services/EventApi';
import { VenueAPI } from './services/VenueApi';
import { TicketTypeAPI } from './services/TicketTypeApi';
import { OrganizationMemberAPI } from './services/OrganizationMemberApi';
import { OrderAPI } from './services/OrderApi';
import { PaymentAPI } from './services/PaymentApi';
import { UserAPI } from './services/UserApi';
import { RefundRequestAPI } from './services/RefundRequestApi';
import { FlexPassAPI } from './services/FlexPassApi';
import { FileAPI } from './services/FileApi';

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
    [UserAPI.reducerPath]: UserAPI.reducer,
    [RefundRequestAPI.reducerPath]: RefundRequestAPI.reducer,
    [FlexPassAPI.reducerPath]: FlexPassAPI.reducer,
    [FileAPI.reducerPath]: FileAPI.reducer,
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
      .concat(PaymentAPI.middleware)
      .concat(UserAPI.middleware)
      .concat(RefundRequestAPI.middleware)
      .concat(FlexPassAPI.middleware)
      .concat(FileAPI.middleware),
});

export const persistor = persistStore(store);

// Override auth type: persistReducer wraps AuthState in PersistPartial which hides fields.
// Casting back to AuthState gives correct autocomplete and type safety across all selectors.
type StoreState = ReturnType<typeof store.getState>;
export type RootState = Omit<StoreState, 'auth'> & { auth: AuthState };
export type AppDispatch = typeof store.dispatch;
