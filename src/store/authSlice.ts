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
  userToken: string | null; // Token gốc của người dùng
  accessToken: string | null; // Token đang hoạt động (có thể là farm token)
  user: UserInfo | null;
  currentFarmId: string | null;
}

const initialState: AuthState = {
  isAuthenticated: !!localStorage.getItem('userToken'),
  userToken: localStorage.getItem('userToken'),
  accessToken: localStorage.getItem('accessToken') || localStorage.getItem('userToken'),
  user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null,
  currentFarmId: localStorage.getItem('currentFarmId')
};


const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<AuthTokens>) => {
      state.isAuthenticated = true;
      state.userToken = action.payload.accessToken;
      state.accessToken = action.payload.accessToken;
      
      localStorage.setItem('userToken', action.payload.accessToken);
      localStorage.setItem('accessToken', action.payload.accessToken);
      localStorage.setItem('refreshToken', action.payload.refreshToken);
      if (action.payload.user) {
        state.user = action.payload.user;
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      } else {
        state.user = null;
      }
    },

    logout: (state) => {
      state.isAuthenticated = false;
      state.userToken = null;
      state.accessToken = null;
      state.user = null;
      state.currentFarmId = null;
      localStorage.clear();
    },

    // Chọn farm - lưu farmToken làm accessToken hiện tại
    selectFarm: (state, action: PayloadAction<{ token: string; farmId: string }>) => {
      state.currentFarmId = action.payload.farmId;
      state.accessToken = action.payload.token;
      
      localStorage.setItem('currentFarmId', action.payload.farmId);
      localStorage.setItem('accessToken', action.payload.token);
    },

    // Thoát farm - quay về Hub, khôi phục userToken
    clearFarmContext: (state) => {
      state.currentFarmId = null;
      state.accessToken = state.userToken;
      
      localStorage.removeItem('currentFarmId');
      // Khôi phục accessToken về userToken trong localStorage
      if (state.userToken) {
        localStorage.setItem('accessToken', state.userToken);
      } else {
        localStorage.removeItem('accessToken');
      }
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

export const { setCredentials, logout, setAccessToken, selectFarm, clearFarmContext } = authSlice.actions;
export default authSlice.reducer;