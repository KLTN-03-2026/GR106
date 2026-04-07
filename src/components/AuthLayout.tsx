import React from 'react';
import { useNavigate } from 'react-router-dom';
import LoginBg from '@/assets/Login-Background.png';
import LogoBrowser from '@/assets/Logo-browser.png';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen w-full bg-white overflow-hidden">
      {/* Left Section */}
      <div className="relative flex w-full h-full lg:w-1/2 overflow-hidden">

        {/* Logo - absolute */}
        <button
          type="button"
          onClick={() => navigate('/')}
          className="absolute left-6 top-5 flex items-center gap-3 bg-transparent border-none cursor-pointer rounded-md p-2 transition-transform duration-300 hover:scale-105 z-10"
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

        {/* Form centered */}
        <div className="flex w-full h-full items-center justify-center px-6 pt-20 pb-6 lg:px-10">
          <div className="w-full max-w-[420px] rounded-xl bg-white p-5 shadow-[0_10px_40px_rgba(0,0,0,0.08),0_2px_8px_rgba(0,0,0,0.04)] animate-[slideInLeft_0.5s_ease-out] max-h-full overflow-y-auto no-scrollbar">
            {/* Header */}
            <div className="mb-5">
              <h1 className="text-2xl font-extrabold text-gray-800 mb-1">{title}</h1>
              {subtitle && <p className="text-gray-500 text-sm">{subtitle}</p>}
            </div>

            {/* Content */}
            {children}
          </div>
        </div>
      </div>

      {/* Right Section - Image */}
      <div className="relative hidden w-1/2 lg:block">
        <img src={LoginBg} alt="Background" className="h-full w-full object-cover rounded-l-2xl" />
      </div>
    </div>
  );
};