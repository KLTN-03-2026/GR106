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
  currentFarmId: string | null;
}

const initialState: AuthState = {
  isAuthenticated: !!localStorage.getItem('accessToken'),
  accessToken: localStorage.getItem('accessToken'),
  user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null,
  currentFarmId: localStorage.getItem('currentFarmId')
};


const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<AuthTokens>) => {
      state.isAuthenticated = true;
      state.accessToken = action.payload.accessToken;
      localStorage.setItem('accessToken', action.payload.accessToken);
      localStorage.setItem('refreshToken', action.payload.refreshToken);
    },

    logout: (state) => {
      state.isAuthenticated = false;
      state.accessToken = null;
      state.user = null;
      localStorage.clear();
    },

    setAccessToken: (state, action: PayloadAction<{ token: string; farmId?: string }>) => {
      state.accessToken = action.payload.token;
      localStorage.setItem('accessToken', action.payload.token);
      if (action.payload.farmId) {
        state.currentFarmId = action.payload.farmId;
        localStorage.setItem('currentFarmId', action.payload.farmId);
      }
    }
  }
});

export const { setCredentials, logout, setAccessToken } = authSlice.actions;
export default authSlice.reducer;