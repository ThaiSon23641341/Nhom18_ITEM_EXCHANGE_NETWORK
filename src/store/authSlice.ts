import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../models/userModel';

interface AuthState {
  user: User | null;
}

const initialState: AuthState = { user: null };

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
  },
});

export const { clearAuthenticatedUser, setAuthenticatedUser } = authSlice.actions;
export default authSlice.reducer;
