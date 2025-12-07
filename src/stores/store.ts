import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from './storage';
import { AuthAPI } from './services/AuthApi';
import { OrganizerAPI } from './services/OrganizerApi';
import authReducer from './slices/authSlice';
import { CategoryAPI } from './services/CategoryApi';
import { EventAPI } from './services/EventApi';
import { VenueAPI } from './services/VenueApi';
import { TicketTypeAPI } from './services/TicketTypeApi';
import { OrganizationMemberAPI } from './services/OrganizationMemberApi';

// Redux Persist configuration for auth slice
// SECURITY: Do NOT persist tokens! They are stored in HTTPOnly cookies
// Only persist non-sensitive user data
const persistConfig = {
  key: 'auth',
  storage,
  whitelist: ['user'], // Only persist user data, NOT tokens
  blacklist: ['accessToken', 'refreshToken'], // Never persist tokens
};

const persistedAuthReducer = persistReducer(persistConfig, authReducer);

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    [AuthAPI.reducerPath]: AuthAPI.reducer,
    [OrganizerAPI.reducerPath]: OrganizerAPI.reducer,
    [CategoryAPI.reducerPath]: CategoryAPI.reducer,
    [EventAPI.reducerPath]: EventAPI.reducer,
    [VenueAPI.reducerPath]: VenueAPI.reducer,
    [TicketTypeAPI.reducerPath]: TicketTypeAPI.reducer,
    [OrganizationMemberAPI.reducerPath]: OrganizationMemberAPI.reducer,
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
      .concat(OrganizationMemberAPI.middleware),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
