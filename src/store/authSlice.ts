import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthTokens } from '../types/auth';

interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null; // Token đang hoạt động (Hub token hoặc Farm token)
  currentFarmId: string | null;
  subscriptionVersion: number;
}

const initialState: AuthState = {
  isAuthenticated: !!localStorage.getItem('accessToken'),
  accessToken: localStorage.getItem('accessToken'),
  currentFarmId: localStorage.getItem('currentFarmId'),
  subscriptionVersion: 0
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<AuthTokens>) => {
      state.isAuthenticated = true;
      state.accessToken = action.payload.accessToken;
      
      localStorage.setItem('accessToken', action.payload.accessToken);
      localStorage.setItem('refreshToken', action.payload.refreshToken);
    },

    setCredentials: (state, action: PayloadAction<AuthTokens>) => {
      state.isAuthenticated = true;
      state.accessToken = action.payload.accessToken;
      
      localStorage.setItem('accessToken', action.payload.accessToken);
      localStorage.setItem('refreshToken', action.payload.refreshToken);
    },

    logout: (state) => {
      state.isAuthenticated = false;
      state.accessToken = null;
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

    // Thoát farm - quay về Hub (LƯU Ý: accessToken sẽ cần được cập nhật lại từ nguồn khác nếu muốn quay về Hub token)
    clearFarmContext: (state) => {
      state.currentFarmId = null;
      localStorage.removeItem('currentFarmId');
    },

    setAccessToken: (state, action: PayloadAction<{ token: string; farmId?: string }>) => {
      state.accessToken = action.payload.token;
      localStorage.setItem('accessToken', action.payload.token);
      
      if (action.payload.farmId) {
        state.currentFarmId = action.payload.farmId;
        localStorage.setItem('currentFarmId', action.payload.farmId);
      }
    },

    refreshSubscription: (state) => {
      state.subscriptionVersion += 1;
    }
  }
});

export const { loginSuccess, setCredentials, logout, setAccessToken, selectFarm, clearFarmContext, refreshSubscription } = authSlice.actions;
export default authSlice.reducer;