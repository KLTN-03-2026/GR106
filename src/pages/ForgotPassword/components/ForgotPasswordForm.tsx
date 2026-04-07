import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link } from 'react-router-dom';
import { Loader2, Mail, ArrowLeft, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { authService } from '../../../services/authService';

const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email là bắt buộc').email('Định dạng email không hợp lệ')
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export const ForgotPasswordForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

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
      setServerError(null);
      await authService.forgotPassword(data.email);
      setIsSubmitted(true);
    } catch (error: any) {
      // Show error inside the form instead of toast
      setServerError(error.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-4"
      >
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-emerald-100 mb-6 transition-transform hover:scale-110 duration-300">
          <Mail className="h-8 w-8 text-emerald-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">
          Kiểm tra email của bạn
        </h3>
        <p className="text-sm text-gray-600 mb-8 max-w-xs mx-auto leading-relaxed">
          Chúng tôi đã gửi một liên kết khôi phục mật khẩu đến email của bạn.
          Vui lòng kiểm tra hộp thư đến.
        </p>
        <Link
          to="/login"
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 hover:-translate-y-0.5 transition-all"
        >
          Quay lại đăng nhập
        </Link>
      </motion.div>
    );
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
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

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-bold text-gray-800 mb-2"
        >
          Email đã đăng ký
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
          </div>
          <input
            id="email"
            type="email"
            disabled={isLoading}
            className={`block w-full pl-11 pr-4 py-2.5 bg-white border ${
              errors.email || serverError 
                ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500' 
                : 'border-gray-200 focus:ring-emerald-500 focus:border-emerald-500'
            } rounded-lg shadow-sm text-sm transition-all focus:outline-none focus:ring-[3px] focus:ring-emerald-500/10 placeholder:text-gray-400`}
            placeholder="nhanvien@trangtrai.com"
            {...register('email')}
          />
        </div>
        <AnimatePresence>
          {errors.email && (
            <motion.p 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-1.5 text-xs font-medium text-red-600 overflow-hidden"
            >
              {errors.email.message}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-bold text-white bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            'Gửi yêu cầu khôi phục'
          )}
        </button>
      </div>

      <div className="text-center pt-2">
        <Link
          to="/login"
          className="inline-flex items-center text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại đăng nhập
        </Link>
      </div>
    </form>
  );
};