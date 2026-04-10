import axios from 'axios';
import { ENV } from './env';


export const axiosInstance = axios.create({
  baseURL: ENV.API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add the access token
axiosInstance.interceptors.request.use(
  (config) => {
    // Không gửi token cho các API Auth (login, register, forgot-password, v.v.)
    // Ngoại trừ API refresh nếu cần (ở đây refresh dùng custom axios hoặc payload)
    const isPublicRoute = 
      config.url?.includes('/auth/login') || 
      config.url?.includes('/auth/register') ||
      config.url?.includes('/auth/refresh') ||
      config.url?.includes('/auth/verify');
    
    const farmToken = localStorage.getItem('farmToken');
    const accessToken = localStorage.getItem('accessToken');
    const token = farmToken || accessToken;

    if (token && config.headers && !isPublicRoute) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token expiration (401 error)
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Nếu lỗi 401 (Unauthorized) và không phải là lỗi từ API Auth (để tránh loop vô tận)
    if (error.response?.status === 401 && !originalRequest._retry) {
      const isAuthRoute = 
        originalRequest.url?.includes('/auth/login') || 
        originalRequest.url?.includes('/auth/refresh');

      if (!isAuthRoute) {
        originalRequest._retry = true;

        try {
          const refreshToken = localStorage.getItem('refreshToken');
          if (!refreshToken) {
            throw new Error('No refresh token available');
          }

          // Gọi API refresh token
          // Lưu ý: Sử dụng axios trực tiếp thay vì axiosInstance để tránh interceptor lặp
          const response = await axios.post(`${ENV.API_BASE_URL}/api/v1/auth/refresh`, {
            refreshToken
          });

          if (response.data.success) {
            const { accessToken, refreshToken: newRefreshToken } = response.data.data;

            // 1. Cập nhật LocalStorage
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', newRefreshToken);

            // 2. Cập nhật Header cho request cũ
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;

            // 3. Thực hiện lại request ban đầu
            return axiosInstance(originalRequest);
          }
        } catch (refreshError) {
          // Nếu refresh thất bại, logout người dùng
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
    }

    return Promise.reject(error);
  }
);