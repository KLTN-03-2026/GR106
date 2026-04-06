import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { authService } from '../../../services/authService';
const resetPasswordSchema = z.
object({
  password: z.
  string().
  min(8, 'Mật khẩu phải có ít nhất 8 ký tự').
  regex(/[A-Z]/, 'Mật khẩu phải chứa ít nhất 1 chữ hoa').
  regex(/[0-9]/, 'Mật khẩu phải chứa ít nhất 1 số'),
  confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu')
}).
refine((data) => data.password === data.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmPassword']
});
type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
export const ResetPasswordForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema)
  });
  const onSubmit = async (data: ResetPasswordValues) => {
    if (!token) {
      toast.error('Token không hợp lệ hoặc đã hết hạn');
      return;
    }
    try {
      setIsLoading(true);
      await authService.resetPassword({
        token,
        newPassword: data.password
      });
      toast.success('Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại.');
      navigate('/login');
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.'
      );
    } finally {
      setIsLoading(false);
    }
  };
  if (!token) {
    return (
      <div className="text-center py-4">
        <p className="text-red-600 mb-4">
          Liên kết đặt lại mật khẩu không hợp lệ hoặc đã thiếu token.
        </p>
        <button
          onClick={() => navigate('/forgot-password')}
          className="text-emerald-600 hover:text-emerald-700 font-medium">
          
          Yêu cầu liên kết mới
        </button>
      </div>);

  }
  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700">
          
          Mật khẩu mới
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="password"
            type="password"
            disabled={isLoading}
            className={`block w-full pl-10 pr-3 py-2 border ${errors.password ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-emerald-500 focus:border-emerald-500'} rounded-md shadow-sm sm:text-sm transition-colors`}
            placeholder="••••••••"
            {...register('password')} />
          
        </div>
        {errors.password &&
        <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
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

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
          
          {isLoading ?
          <Loader2 className="w-5 h-5 animate-spin" /> :

          'Lưu mật khẩu mới'
          }
        </button>
      </div>
    </form>);

};