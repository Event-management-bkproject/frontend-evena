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
import { ActivityLogAPI } from './services/ActivityLogApi';
import { StorageAPI } from './services/StorageApi';

// UI state persist — only sidebar preference, purely cosmetic.
// Auth is NOT persisted: accessToken lives in memory and is restored from
// the httpOnly refresh-token cookie by AuthInitializer on every app boot.
const uiPersistConfig = {
  key: 'ui',
  storage,
  whitelist: ['sidebarOpen'],
};

const persistedUiReducer = persistReducer(uiPersistConfig, uiReducer);

export const store = configureStore({
  reducer: {
    auth: authReducer,          // plain reducer — no localStorage, token lives in memory
    ui: persistedUiReducer,
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
    [ActivityLogAPI.reducerPath]: ActivityLogAPI.reducer,
    [StorageAPI.reducerPath]: StorageAPI.reducer,
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
      .concat(FileAPI.middleware)
      .concat(ActivityLogAPI.middleware)
      .concat(StorageAPI.middleware),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState> & { auth: AuthState };
export type AppDispatch = typeof store.dispatch;
