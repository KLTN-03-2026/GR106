import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link } from 'react-router-dom';
import { Loader2, Mail, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { authService } from '../../../services/authService';
const forgotPasswordSchema = z.object({
  email: z.
  string().
  min(1, 'Email là bắt buộc').
  email('Định dạng email không hợp lệ')
});
type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
export const ForgotPasswordForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema)
  });
  const onSubmit = async (data: ForgotPasswordValues) => {
    try {
      setIsLoading(true);
      await authService.forgotPassword(data.email);
      setIsSubmitted(true);
      toast.success('Đã gửi hướng dẫn khôi phục mật khẩu đến email của bạn');
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.'
      );
    } finally {
      setIsLoading(false);
    }
  };
  if (isSubmitted) {
    return (
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-emerald-100 mb-4">
          <Mail className="h-6 w-6 text-emerald-600" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Kiểm tra email của bạn
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Chúng tôi đã gửi một liên kết khôi phục mật khẩu đến email của bạn.
          Vui lòng kiểm tra hộp thư đến.
        </p>
        <Link
          to="/login"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition-colors">
          
          Quay lại đăng nhập
        </Link>
      </div>);

  }
  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700">
          
          Email đã đăng ký
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="email"
            type="email"
            disabled={isLoading}
            className={`block w-full pl-10 pr-3 py-2 border ${errors.email ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-emerald-500 focus:border-emerald-500'} rounded-md shadow-sm sm:text-sm transition-colors`}
            placeholder="nhanvien@trangtrai.com"
            {...register('email')} />
          
        </div>
        {errors.email &&
        <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
        }
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
          
          {isLoading ?
          <Loader2 className="w-5 h-5 animate-spin" /> :

          'Gửi yêu cầu khôi phục'
          }
        </button>
      </div>

      <div className="mt-6 text-center">
        <Link
          to="/login"
          className="inline-flex items-center text-sm font-medium text-emerald-600 hover:text-emerald-500">
          
          <ArrowLeft className="w-4 h-4 mr-1" />
          Quay lại đăng nhập
        </Link>
      </div>
    </form>);

};