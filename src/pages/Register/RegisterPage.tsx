import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Eye, EyeOff, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { Input } from '../../components/ui/input';
import { useRegister } from '../../hooks/register/useRegister';
import LoginBg from '@/assets/Login-Background.png';
import LogoBrowser from '@/assets/Logo-browser.png';

export function RegisterPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    form: {
      register,
      formState: { errors, isSubmitting },
      getValues,
    },
    serverError,
    isSuccess,
    onSubmit,
  } = useRegister();

  useEffect(() => {
    if (!isSuccess) return;
    const timer = setTimeout(() => {
      const email = getValues('email');
      navigate('/verify-email', { state: { email } });
    }, 2000);
    return () => clearTimeout(timer);
  }, [isSuccess, navigate, getValues]);

  return (
    <div className="flex h-screen w-full bg-white overflow-hidden">
      {/* Left Section */}
      <div className="relative flex w-full h-full lg:w-1/2 items-center justify-center bg-white p-6 md:p-10">

        {/* Logo - Fixed top left */}
        <button
          type="button"
          onClick={() => navigate('/')}
          className="fixed left-6 top-5 flex items-center gap-3 rounded-lg bg-white/80 backdrop-blur-sm p-2 transition-transform duration-300 hover:scale-105 z-50 shadow-sm border border-gray-100"
        >
          <img
            src={LogoBrowser}
            alt="FarmerAI logo"
            className="h-8 w-auto object-contain md:h-10"
          />
          <span className="bg-gradient-to-r from-emerald-800 to-emerald-500 bg-clip-text font-prompt text-[38px] font-extrabold leading-none text-transparent drop-shadow-sm">
            farmarAI
          </span>
        </button>

        {/* Form container - Centered with offset */}
        <div className="w-full max-w-[420px] z-10 translate-y-6">
          <div className="w-full rounded-xl bg-white p-6 shadow-[0_10px_40px_rgba(0,0,0,0.08),0_2px_8px_rgba(0,0,0,0.04)] animate-[slideInLeft_0.5s_ease-out] transition-all duration-300">
            {isSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4"
              >
                <div className="mb-4 text-center">
                  <h1 className="mb-1 text-2xl font-extrabold text-gray-800">Chúc mừng!</h1>
                  <p className="text-sm text-gray-500">Tài khoản của bạn đã được tạo</p>
                </div>
                <div className="rounded-lg border border-green-200 bg-green-50 p-6">
                  <div className="flex flex-col items-center text-center gap-4">
                    <CheckCircle2 className="h-12 w-12 text-green-600" />
                    <div className="flex-1">
                      <div className="mb-2 font-bold text-green-800 text-lg">Đăng ký thành công!</div>
                      <div className="mb-4 text-sm text-green-700">
                        Đang chuyển hướng đến trang xác thực email...
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-green-600" />
                        <span className="text-sm text-green-700 font-medium">Vui lòng chờ...</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <>
                <div className="mb-4">
                  <h1 className="mb-0.5 text-2xl font-extrabold text-gray-800">Bắt đầu ngay</h1>
                  <p className="text-sm text-gray-500">Tạo tài khoản để quản lý trang trại</p>
                </div>

                <form onSubmit={onSubmit} className="space-y-3">
                  <AnimatePresence mode="wait">
                    {serverError && (
                      <motion.div
                        initial={{ height: 0, opacity: 0, marginBottom: 0 }}
                        animate={{ height: 'auto', opacity: 1, marginBottom: 12 }}
                        exit={{ height: 0, opacity: 0, marginBottom: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
                          <div className="text-sm font-medium text-red-800">{serverError}</div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Họ và tên */}
                  <div className="space-y-1">
                    <label htmlFor="fullName" className="block text-xs font-bold text-gray-900 uppercase tracking-tight">
                       Họ và tên <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Nguyễn Văn A"
                      disabled={isSubmitting}
                      {...register('fullName')}
                      className="h-9 rounded-lg border-gray-200 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                    />
                    <AnimatePresence>
                      {errors.fullName && (
                        <motion.span
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="block text-[11px] font-medium text-red-500 overflow-hidden"
                        >
                          {errors.fullName.message}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Email */}
                  <div className="space-y-1">
                    <label htmlFor="email" className="block text-xs font-bold text-gray-900 uppercase tracking-tight">
                       Email <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="email@example.com"
                      disabled={isSubmitting}
                      {...register('email')}
                      className="h-9 rounded-lg border-gray-200 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                    />
                    <AnimatePresence>
                      {errors.email && (
                        <motion.span
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="block text-[11px] font-medium text-red-500 overflow-hidden"
                        >
                          {errors.email.message}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Mật khẩu */}
                  <div className="space-y-1">
                    <label htmlFor="password" className="block text-xs font-bold text-gray-900 uppercase tracking-tight">
                       Mật khẩu <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        disabled={isSubmitting}
                        {...register('password')}
                        className="h-9 rounded-lg border-gray-200 pr-11 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 p-1 hover:text-emerald-500 transition-colors"
                      >
                        {showPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </button>
                    </div>
                    <AnimatePresence mode="wait">
                      {errors.password ? (
                        <motion.span
                          key="error"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="block text-[11px] font-medium text-red-500 overflow-hidden"
                        >
                          {errors.password.message}
                        </motion.span>
                      ) : (
                        <motion.span
                          key="hint"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="block text-[10px] text-gray-500"
                        >
                          ≥ 8 ký tự, có chữ hoa và số
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Xác nhận mật khẩu */}
                  <div className="space-y-1">
                    <label htmlFor="confirmPassword" className="block text-xs font-bold text-gray-900 uppercase tracking-tight">
                       Xác nhận mật khẩu <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        disabled={isSubmitting}
                        {...register('confirmPassword')}
                        className="h-9 rounded-lg border-gray-200 pr-11 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 p-1 hover:text-emerald-500 transition-colors"
                      >
                        {showConfirmPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </button>
                    </div>
                    <AnimatePresence>
                      {errors.confirmPassword && (
                        <motion.span
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="block text-[11px] font-medium text-red-500 overflow-hidden"
                        >
                          {errors.confirmPassword.message}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Submit */}
                  <div className="pt-3">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 font-bold text-white transition-all hover:-translate-y-0.5 hover:from-emerald-600 hover:to-emerald-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                      {isSubmitting ? 'Đang đăng ký...' : 'Đăng ký'}
                    </button>
                  </div>

                  <div className="pt-2 text-center text-sm text-gray-500">
                    Đã có tài khoản?{' '}
                    <button
                      type="button"
                      onClick={() => navigate('/login')}
                      className="font-bold text-emerald-600 hover:text-emerald-700 transition-colors underline-offset-4 hover:underline"
                    >
                      Đăng nhập
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right Section - Image with Rounded Corners */}
      <div className="relative hidden w-1/2 lg:block h-full bg-white">
        <img 
          src={LoginBg} 
          alt="Background" 
          className="h-full w-full object-cover shadow-2xl rounded-l-[40px]" 
        />
      </div>
    </div>
  );
}

export default RegisterPage;