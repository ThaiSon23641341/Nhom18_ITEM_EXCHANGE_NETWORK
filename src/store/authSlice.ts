import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../models/userModel';

interface AuthState {
  user: User | null;
  isRestoring: boolean;
}

const initialState: AuthState = { user: null, isRestoring: false };

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthenticatedUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
    },
    clearAuthenticatedUser(state) {
      state.user = null;
    },
    setSessionRestoring(state, action: PayloadAction<boolean>) {
      state.isRestoring = action.payload;
    },
  },
});

export const {
  clearAuthenticatedUser,
  setAuthenticatedUser,
  setSessionRestoring,
} = authSlice.actions;
export default authSlice.reducer;
