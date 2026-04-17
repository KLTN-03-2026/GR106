import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthTokens, UserInfo } from '../types/auth';
import { getUserFromToken } from '../utils/jwt';

interface AuthState {
  isAuthenticated: boolean;
  userToken: string | null; // Token gốc của người dùng
  accessToken: string | null; // Token đang hoạt động (có thể là farm token)
  user: UserInfo | null;
  currentFarmId: string | null;
  subscriptionVersion: number; // Tăng lên để buộc các hook subscription tải lại
}

const savedAccessToken = localStorage.getItem('accessToken') || localStorage.getItem('userToken');
const userFromToken = savedAccessToken ? getUserFromToken(savedAccessToken) : null;
const userFromStorage = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null;

const initialState: AuthState = {
  isAuthenticated: !!localStorage.getItem('userToken'),
  userToken: localStorage.getItem('userToken'),
  accessToken: savedAccessToken,
  user: userFromToken || userFromStorage,
  currentFarmId: localStorage.getItem('currentFarmId'),
  subscriptionVersion: 0
};


const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<AuthTokens>) => {
      state.isAuthenticated = true;
      state.userToken = action.payload.accessToken;
      state.accessToken = action.payload.accessToken;
      
      localStorage.setItem('userToken', action.payload.accessToken);
      localStorage.setItem('accessToken', action.payload.accessToken);
      localStorage.setItem('refreshToken', action.payload.refreshToken);
      
      // Cập nhật user từ token nếu payload không có user sẵn
      const userFromToken = getUserFromToken(action.payload.accessToken);
      if (action.payload.user) {
        state.user = action.payload.user;
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      } else if (userFromToken) {
        state.user = userFromToken;
        localStorage.setItem('user', JSON.stringify(userFromToken));
      } else {
        state.user = null;
      }
    },

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
      
      // Quan trọng: Cập nhật lại user info từ farm token (để lấy Role chuẩn trong farm)
      const userFromFarmToken = getUserFromToken(action.payload.token);
      if (userFromFarmToken) {
        state.user = userFromFarmToken;
        localStorage.setItem('user', JSON.stringify(userFromFarmToken));
      }

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
      
      // Giải mã token mới để cập nhật role/info
      const userFromToken = getUserFromToken(action.payload.token);
      if (userFromToken) {
        state.user = userFromToken;
        localStorage.setItem('user', JSON.stringify(userFromToken));
      }

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