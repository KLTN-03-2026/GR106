import { useNavigate } from 'react-router-dom';
import { Input } from '../../components/ui/input';
import { AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import { useLogin } from '../../hooks/login/useLogin';
import { useState } from 'react';
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
    <div className="h-screen w-full flex">
      {/* Left Section - Form */}
      <div className="w-full lg:w-1/2 h-screen bg-white flex items-center justify-center p-6 md:p-10 relative overflow-hidden">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="absolute top-0 left-0 p-4 md:p-8 flex items-center gap-2.5 bg-none border-none cursor-pointer hover:scale-105 transition-transform duration-300"
        >
          <div className="relative drop-shadow-[0_4px_8px_rgba(5,150,105,0.25)]">
            <img
              src={LogoBrowser}
              alt="FarmerAI logo"
              className="h-8 md:h-10 object-contain transition-transform duration-300 brightness-110 saturate-[1.3]"
            />
          </div>
          <span className="font-prompt font-extrabold text-[38px] leading-none bg-gradient-to-br from-emerald-700 to-emerald-500 bg-clip-text text-transparent">
            farmarAI
          </span>
        </button>
        <div className="w-full max-w-md flex flex-col shadow-[0_10px_40px_rgba(0,0,0,0.08),0_2px_8px_rgba(0,0,0,0.04)] p-6 rounded-xl bg-white animate-[slideIn_0.5s_ease-out]">
          {/* Header */}
          <div className="mb-5">
            <h1 className="text-2xl font-extrabold text-gray-800 mb-1">Chào mừng trở lại!</h1>
            <p className="text-gray-500 text-sm">Đăng nhập để quản lý trang trại của bạn</p>
          </div>

          {/* Form */}
          <form onSubmit={onSubmit}>
            {/* Error Alert */}
            {serverError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex gap-2.5 items-start animate-slide-in-down">
                <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                <div className="text-red-900 text-sm font-medium">{serverError}</div>
              </div>
            )}

            {/* Email Field */}
            <div className="mb-3.5">
              <label htmlFor="email" className="block font-semibold text-gray-900 text-[13px] mb-2.5">Email</label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder="nhập email của bạn"
                  disabled={isSubmitting}
                  aria-invalid={!!errors.email}
                  {...register('email')}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white text-gray-800 placeholder:text-gray-400 transition-all focus:outline-none focus:border-emerald-500 focus:ring-[3px] focus:ring-emerald-500/10 focus:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                />
              </div>
              {errors.email && (
                <span className="text-red-500 text-[13px] font-medium mt-1.5 block animate-slide-in-down-fast">{errors.email.message}</span>
              )}
            </div>

            {/* Password Field */}
            <div className="mb-3.5">
              <div className="flex items-center justify-between mb-2.5">
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
                  aria-invalid={!!errors.password}
                  {...register('password')}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white text-gray-800 placeholder:text-gray-400 transition-all focus:outline-none focus:border-emerald-500 focus:ring-[3px] focus:ring-emerald-500/10 focus:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none text-gray-400 cursor-pointer p-2 flex items-center transition-colors hover:text-emerald-500"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPassword ? (
                    <Eye className="h-5 w-5" />
                  ) : (
                    <EyeOff className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <span className="text-red-500 text-[13px] font-medium mt-1.5 block animate-slide-in-down-fast">{errors.password.message}</span>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2 my-3 mt-8">
              <input
                type="checkbox"
                id="remember"
                className="w-[18px] h-[18px] cursor-pointer accent-emerald-500"
                defaultChecked
              />
              <label htmlFor="remember" className="text-gray-600 text-[13px] cursor-pointer select-none">
                Ghi nhớ đăng nhập
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-5 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-none rounded-lg font-semibold text-sm cursor-pointer transition-all duration-300 flex items-center justify-center gap-1.5 mt-2.5 hover:from-emerald-600 hover:to-emerald-700 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(16,185,129,0.3)] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>

            {/* Divider */}
            <div className="flex items-center my-4 gap-4">
              <div className="flex-1 h-px bg-gray-200" />
              <div className="text-gray-400 text-xs font-medium">hoặc</div>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Sign Up Link */}
            <div className="text-center text-gray-500 text-[13px]">
              Chưa có tài khoản?{' '}
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="text-emerald-500 font-semibold bg-transparent border-none cursor-pointer p-0 no-underline transition-colors hover:text-emerald-600"
              >
                Đăng ký ngay
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Right Section - Image */}
      <div
        className="hidden lg:block w-1/2 bg-cover bg-center relative rounded-l-2xl"
        style={{
          backgroundImage: `url(${LoginBg})`,
        }}
      />
    </div>
  );
}
export default LoginPage;