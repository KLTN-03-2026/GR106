import { useNavigate } from 'react-router-dom';
import { Input } from '../../components/ui/input';
import { AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import { useLogin } from '../../hooks/login/useLogin';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LoginBg from '@/assets/Login-Background.png';
import LogoBrowser from '@/assets/Logo-browser.png';

export function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const {
    form: { register, formState: { errors, isSubmitting } },
    serverError,
    onSubmit,
  } = useLogin();

  return (
    <div className="h-screen w-full flex overflow-hidden bg-white">
      {/* Left Section - Form */}
      <div className="w-full lg:w-1/2 h-full flex items-center justify-center p-6 md:p-10 relative overflow-hidden bg-white">
        {/* Logo - Fixed top left */}
        <button
          type="button"
          onClick={() => navigate('/')}
          className="fixed top-4 left-4 md:top-8 md:left-8 flex items-center gap-3 bg-white/80 backdrop-blur-sm p-2 rounded-lg cursor-pointer hover:scale-105 transition-transform duration-300 z-50 shadow-sm border border-gray-100"
        >
          <img
            src={LogoBrowser}
            alt="FarmerAI logo"
            className="h-8 md:h-10 object-contain"
          />
          <span className="font-prompt font-extrabold text-[38px] leading-none bg-gradient-to-r from-emerald-800 to-emerald-500 bg-clip-text text-transparent drop-shadow-sm">
            farmarAI
          </span>
        </button>

        {/* Login Card - Centered with vertical offset to nudge it down */}
        <div className="w-full max-w-[400px] bg-white rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.08),0_2px_8px_rgba(0,0,0,0.04)] p-7 z-10 translate-y-8 transition-transform duration-500">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-extrabold text-gray-800 mb-1">Chào mừng trở lại!</h1>
            <p className="text-gray-500 text-sm">Đăng nhập để quản lý trang trại của bạn</p>
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} className="space-y-4">
            {/* Error Alert */}
            <AnimatePresence mode="wait">
              {serverError && (
                <motion.div
                  initial={{ height: 0, opacity: 0, marginBottom: 0 }}
                  animate={{ height: 'auto', opacity: 1, marginBottom: 16 }}
                  exit={{ height: 0, opacity: 0, marginBottom: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-2.5 items-start">
                    <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                    <div className="text-red-900 text-sm font-medium">{serverError}</div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email Field */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block font-semibold text-gray-900 text-[13px]">Email</label>
              <Input
                id="email"
                type="email"
                placeholder="nhập email của bạn"
                disabled={isSubmitting}
                {...register('email')}
                className="w-full h-10 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
              />
              <AnimatePresence>
                {errors.email && (
                  <motion.span
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="text-red-500 text-[12px] font-medium block overflow-hidden"
                  >
                    {errors.email.message}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="font-semibold text-gray-900 text-[13px]">Mật khẩu</label>
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="bg-transparent border-none text-emerald-500 text-xs font-medium cursor-pointer p-0 transition-colors hover:text-emerald-600"
                >
                  Quên mật khẩu?
                </button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="nhập mật khẩu của bạn"
                  disabled={isSubmitting}
                  {...register('password')}
                  className="h-10 border-gray-200 pr-11 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 p-1 hover:text-emerald-500 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
              </div>
              <AnimatePresence>
                {errors.password && (
                  <motion.span
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="text-red-500 text-[12px] font-medium block overflow-hidden"
                  >
                    {errors.password.message}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="remember"
                className="w-4 h-4 cursor-pointer accent-emerald-500"
                defaultChecked
              />
              <label htmlFor="remember" className="text-gray-600 text-xs cursor-pointer select-none font-medium">
                Ghi nhớ đăng nhập
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-none rounded-lg font-bold text-sm cursor-pointer transition-all hover:from-emerald-600 hover:to-emerald-700 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Đang đăng nhập...</span>
                  </div>
                ) : (
                  'Đăng nhập'
                )}
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center py-2 gap-4">
              <div className="flex-1 h-px bg-gray-100" />
              <div className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">hoặc</div>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            {/* Sign Up Link */}
            <div className="text-center text-gray-500 text-sm">
              Chưa có tài khoản?{' '}
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="text-emerald-500 font-bold bg-transparent border-none cursor-pointer transition-colors hover:text-emerald-700 underline-offset-4 hover:underline"
              >
                Đăng ký ngay
              </button>
            </div>
          </form>
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
export default LoginPage;