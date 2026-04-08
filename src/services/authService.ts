import { axiosInstance } from '../config/axios';
import {
  ApiResponse,
  AuthTokens,
  LoginRequest,
  RegisterRequest,
  VerifyRequest
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

  async verify(data: VerifyRequest): Promise<ApiResponse<string>> {
    const response = await axiosInstance.post<ApiResponse<string>>(
      '/api/v1/auth/verify',
      data
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

  async forgotPassword(email: string): Promise<ApiResponse<string>> {
    const response = await axiosInstance.post<ApiResponse<string>>(
      '/api/v1/auth/forgot-password',
      { email }
    );
    return response.data;
  },

  async resetPassword(data: any): Promise<ApiResponse<string>> {
    const response = await axiosInstance.post<ApiResponse<string>>(
      '/api/v1/auth/reset-password',
      data
    );
    return response.data;
  },

  async changePassword(data: any): Promise<ApiResponse<string>> {
    const response = await axiosInstance.post<ApiResponse<string>>(
      '/api/v1/auth/change-password',
      data
    );
    return response.data;
  }
};