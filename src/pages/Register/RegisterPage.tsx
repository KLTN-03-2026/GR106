import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Eye, EyeOff, Loader2 } from 'lucide-react';

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
      {/* Left Section - Form Container */}
      <div className="relative flex w-full h-full items-center justify-center px-4 py-4 lg:w-1/2 lg:px-10 overflow-hidden">
        {/* Back Button */}
        <button
          type="button"
          onClick={() => navigate('/')}
          className="absolute left-4 top-4 flex items-center gap-3 rounded-md p-2 transition-transform duration-300 hover:scale-105 md:left-8 md:top-8 z-10"
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

        {/* Content Box */}
        <div className="w-full max-w-[400px] rounded-xl bg-white p-6 shadow-[0_10px_40px_rgba(0,0,0,0.08),0_2px_8px_rgba(0,0,0,0.04)] animate-[slideInLeft_0.5s_ease-out] max-h-full overflow-y-auto no-scrollbar">
          {isSuccess ? (
            <>
              <div className="mb-5">
                <h1 className="mb-1 text-2xl font-extrabold text-gray-800">Chúc mừng!</h1>
                <p className="text-sm text-gray-500">Tài khoản của bạn đã được tạo</p>
              </div>

              <div className="rounded-lg border border-green-200 bg-green-50 p-5">
                <div className="flex items-start gap-4">
                  <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-green-600" />
                  <div className="flex-1">
                    <div className="mb-2 font-semibold text-green-800">Đăng ký thành công!</div>
                    <div className="mb-4 text-sm text-green-700">
                      Đang chuyển hướng đến trang xác thực email...
                    </div>
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-green-600" />
                      <span className="text-sm text-green-700">Vui lòng chờ...</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="mb-5">
                <h1 className="mb-1 text-2xl font-extrabold text-gray-800">Bắt đầu ngay</h1>
                <p className="text-sm text-gray-500">Tạo tài khoản để quản lý trang trại</p>
              </div>

              <form onSubmit={onSubmit}>
                {serverError && (
                  <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 animate-slide-in-down">
                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
                    <div className="text-sm font-medium text-red-800">{serverError}</div>
                  </div>
                )}

                <div className="mb-3">
                  <label htmlFor="fullName" className="mb-1 block text-sm font-semibold text-gray-900">
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Nguyễn Văn A"
                    disabled={isSubmitting}
                    aria-invalid={!!errors.fullName}
                    {...register('fullName')}
                    className="h-10 rounded-lg border-gray-200 text-sm placeholder:text-gray-400 focus:border-emerald-500 focus:ring-emerald-500"
                  />
                  {errors.fullName && (
                    <span className="mt-1 block text-[12px] font-medium text-red-500 animate-slide-in-down-fast">
                      {errors.fullName.message}
                    </span>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="email" className="mb-1 block text-sm font-semibold text-gray-900">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@example.com"
                    disabled={isSubmitting}
                    aria-invalid={!!errors.email}
                    {...register('email')}
                    className="h-10 rounded-lg border-gray-200 text-sm placeholder:text-gray-400 focus:border-emerald-500 focus:ring-emerald-500"
                  />
                  {errors.email && (
                    <span className="mt-1 block text-[12px] font-medium text-red-500 animate-slide-in-down-fast">
                      {errors.email.message}
                    </span>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="password" className="mb-1 block text-sm font-semibold text-gray-900">
                    Mật khẩu <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      disabled={isSubmitting}
                      aria-invalid={!!errors.password}
                      {...register('password')}
                      className="h-10 rounded-lg border-gray-200 pr-11 text-sm placeholder:text-gray-400 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-emerald-600"
                      aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    >
                      {showPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password ? (
                    <span className="mt-1 block text-[12px] font-medium text-red-500 animate-slide-in-down-fast">
                      {errors.password.message}
                    </span>
                  ) : (
                    <span className="mt-1 block text-[11px] text-gray-500">
                      ≥ 8 ký tự, có chữ hoa và số
                    </span>
                  )}
                </div>

                <div className="mb-3">
                  <label
                    htmlFor="confirmPassword"
                    className="mb-1 block text-sm font-semibold text-gray-900"
                  >
                    Xác nhận mật khẩu <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      disabled={isSubmitting}
                      aria-invalid={!!errors.confirmPassword}
                      {...register('confirmPassword')}
                      className="h-10 rounded-lg border-gray-200 pr-11 text-sm placeholder:text-gray-400 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-emerald-600"
                      aria-label={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    >
                      {showConfirmPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <span className="mt-1 block text-[12px] font-medium text-red-500 animate-slide-in-down-fast">
                      {errors.confirmPassword.message}
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 font-semibold text-white transition-all hover:-translate-y-0.5 hover:from-emerald-600 hover:to-emerald-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isSubmitting ? 'Đang đăng ký...' : 'Đăng ký'}
                </button>

                <div className="mt-4 text-center text-sm text-gray-500">
                  Đã có tài khoản?{' '}
                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="font-semibold text-emerald-600 transition-colors hover:text-emerald-700"
                  >
                    Đăng nhập
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>

      {/* Right Section - Image */}
      <div className="relative hidden w-1/2 lg:block">
        <img src={LoginBg} alt="Background" className="h-full w-full object-cover rounded-l-2xl" />
      </div>
    </div>
  );
}
export default RegisterPage;