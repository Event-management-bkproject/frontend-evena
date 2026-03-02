// stores/slices/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserResponse } from '../types';

export interface AuthState {
  accessToken: string | null;
  // refreshToken: string | null; // COMMENTED OUT: Backend refresh token not implemented yet
  user: UserResponse | null;
  isInitialized: boolean;
}

const initialState: AuthState = {
  accessToken: null,
  // refreshToken: null, // COMMENTED OUT: Backend refresh token not implemented yet
  user: null,
  isInitialized: false,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Updated: Only accessToken, no refreshToken (backend not implemented yet)
    setCredentials: (
      state,
      action: PayloadAction<{
        accessToken: string;
        // refreshToken: string; // COMMENTED OUT: Backend refresh token not implemented yet
        user: UserResponse;
        isInitialized?: boolean;
      }>,
    ) => {
      state.accessToken = action.payload.accessToken;
      // state.refreshToken = action.payload.refreshToken; // COMMENTED OUT
      state.user = action.payload.user;
      state.isInitialized = action.payload.isInitialized ?? true;
      // Note: Redux persist automatically saves to localStorage
    },

    clearCredentials: (state) => {
      state.accessToken = null;
      // state.refreshToken = null; // COMMENTED OUT
      state.user = null;
      state.isInitialized = true;
      // Note: Redux persist automatically clears from localStorage
    },

    setToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
      // Note: Redux persist automatically saves to localStorage
    },

    // COMMENTED OUT: setRefreshToken (backend not implemented yet)
    // setRefreshToken: (state, action: PayloadAction<string>) => {
    //   state.refreshToken = action.payload;
    // },

    setUser: (state, action: PayloadAction<UserResponse>) => {
      state.user = action.payload;
    },

    setInitialized: (state) => {
      state.isInitialized = true;
    },

    // Updated: Only accessToken, no refreshToken
    setAuthFromInitialization: (
      state,
      action: PayloadAction<{
        accessToken: string | null;
        // refreshToken: string | null; // COMMENTED OUT
        user: UserResponse | null;
      }>,
    ) => {
      state.accessToken = action.payload.accessToken;
      // state.refreshToken = action.payload.refreshToken; // COMMENTED OUT
      state.user = action.payload.user;
      state.isInitialized = true;
      // Note: Redux persist automatically saves to localStorage
    },
  },
});

export const {
  setCredentials,
  clearCredentials,
  setToken,
  // setRefreshToken, // COMMENTED OUT: Backend refresh token not implemented yet
  setUser,
  setInitialized,
  setAuthFromInitialization,
} = authSlice.actions;

export default authSlice.reducer;
