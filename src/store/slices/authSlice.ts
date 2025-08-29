import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User, Session } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'seller' | 'admin';
  address?: string;
  phone?: string;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  session: null,
  profile: null,
  loading: true,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth: (state, action: PayloadAction<{ user: User | null; session: Session | null }>) => {
      state.user = action.payload.user;
      state.session = action.payload.session;
      state.loading = false;
      state.error = null;
    },
    setProfile: (state, action: PayloadAction<UserProfile | null>) => {
      state.profile = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearAuth: (state) => {
      state.user = null;
      state.session = null;
      state.profile = null;
      state.loading = false;
      state.error = null;
    },
  },
});

export const { setAuth, setProfile, setLoading, setError, clearAuth } = authSlice.actions;
export default authSlice.reducer;