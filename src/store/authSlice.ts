import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthTokens } from '../types/auth';

interface UserInfo {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  user: UserInfo | null;
}


const initialState: AuthState = {
  isAuthenticated: !!localStorage.getItem('accessToken'),
  accessToken: localStorage.getItem('accessToken'),
  user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null
};


const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<AuthTokens & { user: UserInfo }>) => {
      state.isAuthenticated = true;
      state.accessToken = action.payload.accessToken;
      state.user = action.payload.user;
      localStorage.setItem('accessToken', action.payload.accessToken);
      localStorage.setItem('refreshToken', action.payload.refreshToken);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
    },

    logout: (state) => {
      state.isAuthenticated = false;
      state.accessToken = null;
      state.user = null;
      localStorage.clear();
    }
  }
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;