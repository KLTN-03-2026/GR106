import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Loader2, Mail, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { authService } from '../../../services/authService';
import { setCredentials } from '../../../store/authSlice';
const loginSchema = z.object({
  email: z.
  string().
  min(1, 'Email là bắt buộc').
  email('Định dạng email không hợp lệ'),
  password: z.string().min(1, 'Mật khẩu là bắt buộc')
});
type LoginFormValues = z.infer<typeof loginSchema>;
export const LoginForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema)
  });
  const onSubmit = async (data: LoginFormValues) => {
    if (isLocked) {
      toast.error('Tài khoản bị khóa tạm thời do đăng nhập sai nhiều lần');
      return;
    }
    try {
      setIsLoading(true);
      const response = await authService.login(data);
      if (response.success) {
        dispatch(setCredentials(response.data));
        toast.success('Đăng nhập thành công');
        navigate('/dashboard');
      } else {
        handleFailedAttempt();
      }
    } catch (error: any) {
      handleFailedAttempt();
      toast.error(
        error.response?.data?.message || 'Email hoặc mật khẩu không đúng'
      );
    } finally {
      setIsLoading(false);
    }
  };
  const handleFailedAttempt = () => {
    const newAttempts = failedAttempts + 1;
    setFailedAttempts(newAttempts);
    if (newAttempts >= 5) {
      setIsLocked(true);
      toast.error(
        'Tài khoản bị khóa tạm thời do đăng nhập sai nhiều lần. Vui lòng thử lại sau 15 phút.'
      );
      // Reset lock after 15 minutes
      setTimeout(
        () => {
          setIsLocked(false);
          setFailedAttempts(0);
        },
        15 * 60 * 1000
      );
    }
  };
  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700">
          
          Email
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="email"
            type="email"
            autoComplete="email"
            disabled={isLoading || isLocked}
            className={`block w-full pl-10 pr-3 py-2 border ${errors.email ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-emerald-500 focus:border-emerald-500'} rounded-md shadow-sm sm:text-sm transition-colors`}
            placeholder="nhanvien@trangtrai.com"
            {...register('email')} />
          
        </div>
        {errors.email &&
        <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
        }
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700">
          
          Mật khẩu
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            disabled={isLoading || isLocked}
            className={`block w-full pl-10 pr-3 py-2 border ${errors.password ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-emerald-500 focus:border-emerald-500'} rounded-md shadow-sm sm:text-sm transition-colors`}
            placeholder="••••••••"
            {...register('password')} />
          
        </div>
        {errors.password &&
        <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
        }
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded" />
          
          <label
            htmlFor="remember-me"
            className="ml-2 block text-sm text-gray-900">
            
            Ghi nhớ đăng nhập
          </label>
        </div>

        <div className="text-sm">
          <Link
            to="/forgot-password"
            className="font-medium text-emerald-600 hover:text-emerald-500">
            
            Quên mật khẩu?
          </Link>
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading || isLocked}
          className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
          
          {isLoading ?
          <Loader2 className="w-5 h-5 animate-spin" /> :

          'Đăng nhập'
          }
        </button>
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Chưa có tài khoản?{' '}
          <Link
            to="/register"
            className="font-medium text-emerald-600 hover:text-emerald-500">
            
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </form>);

};