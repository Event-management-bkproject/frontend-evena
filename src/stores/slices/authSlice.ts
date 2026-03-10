// stores/slices/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserResponse } from '../types';

export interface AuthState {
  accessToken: string | null;
  user: UserResponse | null;
  isInitialized: boolean;
}

const initialState: AuthState = {
  accessToken: null,
  user: null,
  isInitialized: false,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{
        accessToken: string;
        user: UserResponse;
        isInitialized?: boolean;
      }>,
    ) => {
      state.accessToken = action.payload.accessToken;
      state.user = action.payload.user;
      state.isInitialized = action.payload.isInitialized ?? true;
    },

    clearCredentials: (state) => {
      state.accessToken = null;
      state.user = null;
      state.isInitialized = true;
    },

    setToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
    },

    setUser: (state, action: PayloadAction<UserResponse>) => {
      state.user = action.payload;
    },

    setInitialized: (state) => {
      state.isInitialized = true;
    },

    setAuthFromInitialization: (
      state,
      action: PayloadAction<{
        accessToken: string | null;
        user: UserResponse | null;
      }>,
    ) => {
      state.accessToken = action.payload.accessToken;
      state.user = action.payload.user;
      state.isInitialized = true;
    },
  },
});

export const {
  setCredentials,
  clearCredentials,
  setToken,
  setUser,
  setInitialized,
  setAuthFromInitialization,
} = authSlice.actions;

export default authSlice.reducer;
