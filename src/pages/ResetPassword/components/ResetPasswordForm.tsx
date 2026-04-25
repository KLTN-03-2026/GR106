import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { authService } from '../../../services/auth/authService';

import { resetPasswordSchema } from '../../../schemas/authSchemas';

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export const ResetPasswordForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordValues) => {
    if (!token) {
      setServerError('Token không hợp lệ hoặc đã hết hạn');
      return;
    }

    try {
      setIsLoading(true);
      setServerError(null);
      await authService.resetPassword({
        token,
        newPassword: data.password,
      });
      toast.success('Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại.');
      navigate('/login');
    } catch (error: any) {
      setServerError(error.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-6"
      >
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4 text-red-600">
           <AlertCircle className="h-6 w-6" />
        </div>
        <p className="text-red-600 mb-6 font-medium">
          Liên kết đặt lại mật khẩu không hợp lệ hoặc thiếu mã xác thực.
        </p>
        <button
          onClick={() => navigate('/forgot-password')}
          className="text-emerald-600 hover:text-emerald-700 font-bold underline decoration-2 underline-offset-4 transition-all"
        >
          Yêu cầu liên kết mới
        </button>
      </motion.div>
    );
  }

  return (
    <form className="space-y-4 pt-2" onSubmit={handleSubmit(onSubmit)}>
      <AnimatePresence mode="wait">
        {serverError && (
          <motion.div
            initial={{ height: 0, opacity: 0, marginBottom: 0 }}
            animate={{ height: 'auto', opacity: 1, marginBottom: 16 }}
            exit={{ height: 0, opacity: 0, marginBottom: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-2.5 items-start">
              <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              <div className="text-red-900 text-sm font-medium">{serverError}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-1.5">
        <label
          htmlFor="password"
          className="block text-sm font-bold text-gray-800"
        >
          Mật khẩu mới
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-emerald-500 transition-colors">
            <Lock className="h-5 w-5" />
          </div>
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            disabled={isLoading}
            className={`block w-full pl-11 pr-11 py-2.5 border ${
              errors.password ? 'border-red-300 text-red-900' : 'border-gray-200'
            } rounded-lg text-sm bg-white placeholder:text-gray-400 focus:outline-none focus:ring-[3px] focus:ring-emerald-500/10 focus:border-emerald-500 transition-all`}
            placeholder="••••••••"
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-500 transition-colors p-1"
          >
            {showPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </button>
        </div>
        <AnimatePresence>
          {errors.password && (
            <motion.p 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="text-xs font-medium text-red-600 overflow-hidden"
            >
              {errors.password.message}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-bold text-gray-800"
        >
          Xác nhận mật khẩu mới
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-emerald-500 transition-colors">
            <Lock className="h-5 w-5" />
          </div>
          <input
            id="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            disabled={isLoading}
            className={`block w-full pl-11 pr-11 py-2.5 border ${
              errors.confirmPassword ? 'border-red-300 text-red-900' : 'border-gray-200'
            } rounded-lg text-sm bg-white placeholder:text-gray-400 focus:outline-none focus:ring-[3px] focus:ring-emerald-500/10 focus:border-emerald-500 transition-all`}
            placeholder="••••••••"
            {...register('confirmPassword')}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-500 transition-colors p-1"
          >
            {showConfirmPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </button>
        </div>
        <AnimatePresence>
          {errors.confirmPassword && (
            <motion.p 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="text-xs font-medium text-red-600 overflow-hidden"
            >
              {errors.confirmPassword.message}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <div className="pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-3 px-4 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white font-bold text-sm shadow-lg hover:from-emerald-600 hover:to-emerald-700 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            'Lưu mật khẩu mới'
          )}
        </button>
      </div>
    </form>
  );
};