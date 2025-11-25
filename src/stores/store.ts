import { configureStore } from '@reduxjs/toolkit';
import { OrganizerAPI } from './services/OrganizerApi';
import authReducer from './slices/authSlice';
import { CategoryAPI } from './services/CategoryApi';
import { EventAPI } from './services/EventApi';
import { VenueAPI } from './services/VenueApi';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [OrganizerAPI.reducerPath]: OrganizerAPI.reducer,
    [CategoryAPI.reducerPath]: CategoryAPI.reducer,
    [EventAPI.reducerPath]: EventAPI.reducer,
    [VenueAPI.reducerPath]: VenueAPI.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    })
      .concat(OrganizerAPI.middleware)
      .concat(CategoryAPI.middleware)
      .concat(EventAPI.middleware)
      .concat(VenueAPI.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
