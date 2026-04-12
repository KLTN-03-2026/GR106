import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, Mail, Lock, User, Tractor } from 'lucide-react';
import { toast } from 'sonner';
import { useDispatch } from 'react-redux';
import { authService } from '../../../services/authService';
import { farmService } from '../../../services/farmService';
import { setCredentials } from '../../../store/authSlice';
const registerSchema = z.
object({
  fullName: z.string().min(1, 'Họ tên là bắt buộc'),
  email: z.
  string().
  min(1, 'Email là bắt buộc').
  email('Định dạng email không hợp lệ'),
  password: z.
  string().
  min(8, 'Mật khẩu phải có ít nhất 8 ký tự').
  regex(/[A-Z]/, 'Mật khẩu phải chứa ít nhất 1 chữ hoa').
  regex(/[0-9]/, 'Mật khẩu phải chứa ít nhất 1 số'),
  confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu'),
  farmName: z.string().min(1, 'Tên trang trại là bắt buộc')
}).
refine((data) => data.password === data.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmPassword']
});
type RegisterFormValues = z.infer<typeof registerSchema>;
export const RegisterForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema)
  });
  const onSubmit = async (data: RegisterFormValues) => {
    try {
      setIsLoading(true);
      
      // 1. Register Account
      const regPayload = {
        email: data.email,
        password: data.password,
        fullName: data.fullName
      };
      const regResponse = await authService.register(regPayload);
      
      if (!regResponse.success) {
        throw new Error(regResponse.message || 'Đăng ký không thành công');
      }

      // 2. Automatic Login to get Token
      const loginResponse = await authService.login({
        email: data.email,
        password: data.password
      });

      if (loginResponse.success && loginResponse.data.accessToken) {
        // Cập nhật Redux ngay để có token gọi API tiếp theo
        dispatch(setCredentials(loginResponse.data));

        // 3. Create Initial Farm
        try {
          await farmService.createFarm({
            name: data.farmName,
            description: `Trang trại của ${data.fullName}`
          });
          
          toast.success('Đăng ký và tạo trang trại thành công!');
          navigate('/dashboard');
        } catch (farmError: any) {
          console.error('Lỗi tạo farm:', farmError);
          toast.success('Đăng ký thành công! Tuy nhiên không thể tạo trang trại tự động. Vui lòng tạo thủ công sau khi đăng nhập.');
          navigate('/login');
        }
      } else {
        toast.success('Đăng ký thành công! Vui lòng đăng nhập.');
        navigate('/login');
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || error.message ||
        'Có lỗi xảy ra khi đăng ký. Email có thể đã tồn tại.'
      );
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label
          htmlFor="fullName"
          className="block text-sm font-medium text-gray-700">
          
          Họ và tên
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <User className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="fullName"
            type="text"
            disabled={isLoading}
            className={`block w-full pl-10 pr-3 py-2 border ${errors.fullName ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-emerald-500 focus:border-emerald-500'} rounded-md shadow-sm sm:text-sm transition-colors`}
            placeholder="Nguyễn Văn A"
            {...register('fullName')} />
          
        </div>
        {errors.fullName &&
        <p className="mt-1.5 text-sm text-red-600">
            {errors.fullName.message}
          </p>
        }
      </div>

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
            disabled={isLoading}
            className={`block w-full pl-10 pr-3 py-2 border ${errors.email ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-emerald-500 focus:border-emerald-500'} rounded-md shadow-sm sm:text-sm transition-colors`}
            placeholder="nhanvien@trangtrai.com"
            {...register('email')} />
          
        </div>
        {errors.email &&
        <p className="mt-1.5 text-sm text-red-600">{errors.email.message}</p>
        }
      </div>

      <div>
        <label
          htmlFor="farmName"
          className="block text-sm font-medium text-gray-700">
          
          Tên trang trại
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Tractor className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="farmName"
            type="text"
            disabled={isLoading}
            className={`block w-full pl-10 pr-3 py-2 border ${errors.farmName ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-emerald-500 focus:border-emerald-500'} rounded-md shadow-sm sm:text-sm transition-colors`}
            placeholder="Trang trại Xanh"
            {...register('farmName')} />
          
        </div>
        {errors.farmName &&
        <p className="mt-1.5 text-sm text-red-600">
            {errors.farmName.message}
          </p>
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
            disabled={isLoading}
            className={`block w-full pl-10 pr-3 py-2 border ${errors.password ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-emerald-500 focus:border-emerald-500'} rounded-md shadow-sm sm:text-sm transition-colors`}
            placeholder="••••••••"
            {...register('password')} />
          
        </div>
        {errors.password &&
        <p className="mt-1.5 text-sm text-red-600">
            {errors.password.message}
          </p>
        }
      </div>

      <div>
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-medium text-gray-700">
          
          Xác nhận mật khẩu
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
        <p className="mt-1.5 text-sm text-red-600">
            {errors.confirmPassword.message}
          </p>
        }
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
          
          {isLoading ?
          <Loader2 className="w-5 h-5 animate-spin" /> :

          'Đăng ký tài khoản'
          }
        </button>
      </div>

      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          Đã có tài khoản?{' '}
          <Link
            to="/login"
            className="font-medium text-emerald-600 hover:text-emerald-500">
            
            Đăng nhập
          </Link>
        </p>
      </div>
    </form>);

};