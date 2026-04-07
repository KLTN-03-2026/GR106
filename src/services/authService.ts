import { axiosInstance } from '../config/axios';
import {
  ApiResponse,
  AuthTokens,
  LoginRequest,
  RegisterRequest
} from '../types/auth';

export const authService = {
  async register(data: RegisterRequest): Promise<ApiResponse<string>> {
    const response = await axiosInstance.post<ApiResponse<string>>(
      '/api/v1/auth/register',
      data
    );
    return response.data;
  },

  async login(data: LoginRequest): Promise<ApiResponse<AuthTokens>> {
    const response = await axiosInstance.post<ApiResponse<AuthTokens>>(
      '/api/v1/auth/login',
      data
    );
    return response.data;
  },

  async verify(token: string): Promise<ApiResponse<string>> {
    const response = await axiosInstance.post<ApiResponse<string>>(
      `/api/v1/auth/verify?token=${token}`
    );
    return response.data;
  },

  async refresh(refreshToken: string): Promise<ApiResponse<AuthTokens>> {
    const response = await axiosInstance.post<ApiResponse<AuthTokens>>(
      '/api/v1/auth/refresh',
      { refreshToken }
    );
    return response.data;
  },

  // Placeholder APIs for future implementation
  async forgotPassword(_email: string): Promise<ApiResponse<string>> {
    // Mock API call
    return new Promise((resolve) =>
    setTimeout(
      () =>
      resolve({
        success: true,
        code: 0,
        message: 'Email sent',
        data: 'Success',
        timestamp: new Date().toISOString()
      }),
      1000
    )
    );
  },

  async resetPassword(_data: any): Promise<ApiResponse<string>> {
    // Mock API call
    return new Promise((resolve) =>
    setTimeout(
      () =>
      resolve({
        success: true,
        code: 0,
        message: 'Password reset successful',
        data: 'Success',
        timestamp: new Date().toISOString()
      }),
      1000
    )
    );
  },

  async changePassword(_data: any): Promise<ApiResponse<string>> {
    // Mock API call
    return new Promise((resolve) =>
    setTimeout(
      () =>
      resolve({
        success: true,
        code: 0,
        message: 'Password changed successfully',
        data: 'Success',
        timestamp: new Date().toISOString()
      }),
      1000
    )
    );
  }
};