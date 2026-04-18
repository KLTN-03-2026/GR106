import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthTokens } from '../types/auth';

interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null; // Token đang hoạt động (Hub token hoặc Farm token)
  hubToken: string | null;    // Token Hub gốc dùng để khôi phục khi thoát Farm
  currentFarmId: string | null;
  subscriptionVersion: number;
}

const initialState: AuthState = {
  isAuthenticated: !!localStorage.getItem('accessToken'),
  accessToken: localStorage.getItem('accessToken'),
  hubToken: localStorage.getItem('hubToken'),
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
      state.hubToken = action.payload.accessToken;
      
      localStorage.setItem('accessToken', action.payload.accessToken);
      localStorage.setItem('hubToken', action.payload.accessToken);
      localStorage.setItem('refreshToken', action.payload.refreshToken);
    },

    setCredentials: (state, action: PayloadAction<AuthTokens>) => {
      state.isAuthenticated = true;
      state.accessToken = action.payload.accessToken;
      state.hubToken = action.payload.accessToken;
      
      localStorage.setItem('accessToken', action.payload.accessToken);
      localStorage.setItem('hubToken', action.payload.accessToken);
      localStorage.setItem('refreshToken', action.payload.refreshToken);
    },

    logout: (state) => {
      state.isAuthenticated = false;
      state.accessToken = null;
      state.hubToken = null;
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

    // Thoát farm - quay về Hub bằng cách khôi phục accessToken từ hubToken
    clearFarmContext: (state) => {
      state.currentFarmId = null;
      if (state.hubToken) {
        state.accessToken = state.hubToken;
        localStorage.setItem('accessToken', state.hubToken);
      }
      localStorage.removeItem('currentFarmId');
    },

    setAccessToken: (state, action: PayloadAction<{ token: string; farmId?: string }>) => {
      state.accessToken = action.payload.token;
      localStorage.setItem('accessToken', action.payload.token);
      
      if (action.payload.farmId) {
        state.currentFarmId = action.payload.farmId;
        localStorage.setItem('currentFarmId', action.payload.farmId);
      } else {
        // Nếu setAccessToken không kèm farmId, coi như đây là hub token mới
        state.hubToken = action.payload.token;
        localStorage.setItem('hubToken', action.payload.token);
      }
    },


    refreshSubscription: (state) => {
      state.subscriptionVersion += 1;
    }
  }
});

export const { loginSuccess, setCredentials, logout, setAccessToken, selectFarm, clearFarmContext, refreshSubscription } = authSlice.actions;
export default authSlice.reducer;