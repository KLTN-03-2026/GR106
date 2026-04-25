import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { Loader2, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { authService } from '../../../services/auth/authService';
import { useAuth } from '../../../hooks/auth/useAuth';
import { changePasswordSchema } from '../../../schemas/authSchemas';
type ChangePasswordValues = z.infer<typeof changePasswordSchema>;
export const ChangePasswordForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema)
  });
  const onSubmit = async (data: ChangePasswordValues) => {
    try {
      setIsLoading(true);
      await authService.changePassword(data);
      toast.success('Đổi mật khẩu thành công. Vui lòng đăng nhập lại.');
      logout();
      navigate('/login');
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
        'Có lỗi xảy ra. Vui lòng kiểm tra lại mật khẩu hiện tại.'
      );
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label
          htmlFor="currentPassword"
          className="block text-sm font-medium text-gray-700">
          
          Mật khẩu hiện tại
        </label>
        <div className="mt-1 relative rounded-2xl shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="currentPassword"
            type="password"
            disabled={isLoading}
            className={`block w-full h-12 pl-10 pr-3 py-2 border ${errors.currentPassword ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-emerald-500 focus:border-emerald-500'} rounded-2xl shadow-sm sm:text-sm transition-all bg-gray-50/50 hover:bg-white focus:bg-white`}
            placeholder="••••••••"
            {...register('currentPassword')} />
          
        </div>
        {errors.currentPassword &&
        <p className="mt-2 text-sm text-red-600">
            {errors.currentPassword.message}
          </p>
        }
      </div>

      <div>
        <label
          htmlFor="newPassword"
          className="block text-sm font-medium text-gray-700">
          
          Mật khẩu mới
        </label>
        <div className="mt-1 relative rounded-2xl shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="newPassword"
            type="password"
            disabled={isLoading}
            className={`block w-full h-12 pl-10 pr-3 py-2 border ${errors.newPassword ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-emerald-500 focus:border-emerald-500'} rounded-2xl shadow-sm sm:text-sm transition-all bg-gray-50/50 hover:bg-white focus:bg-white`}
            placeholder="••••••••"
            {...register('newPassword')} />
          
        </div>
        {errors.newPassword &&
        <p className="mt-2 text-sm text-red-600">
            {errors.newPassword.message}
          </p>
        }
      </div>

      <div>
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-medium text-gray-700">
          
          Xác nhận mật khẩu mới
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="confirmPassword"
            type="password"
            disabled={isLoading}
            className={`block w-full pl-10 pr-3 py-2 border ${errors.confirmPassword ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-emerald-500 focus:border-emerald-500'} rounded-md shadow-sm sm:text-sm transition-colors`}
            placeholder="••••••••"
            {...register('confirmPassword')} />
          
        </div>
        {errors.confirmPassword &&
        <p className="mt-2 text-sm text-red-600">
            {errors.confirmPassword.message}
          </p>
        }
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-4 px-4 border border-transparent rounded-2xl shadow-lg shadow-emerald-200 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]">
          
          {isLoading ?
          <Loader2 className="w-6 h-6 animate-spin" /> :

          'Cập nhật mật khẩu'
          }
        </button>
      </div>
    </form>);

};