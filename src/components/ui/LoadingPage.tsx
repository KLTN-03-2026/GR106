import React from 'react';
import { Sprout, Sun, CloudRain, Leaf, Wind } from 'lucide-react';

export const LoadingPage: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-gradient-to-b from-blue-50 via-green-50 to-yellow-50 flex items-center justify-center">
      <div className="relative">
        {/* Animated Sun */}
        <div className="absolute -top-20 -right-20 animate-pulse">
          <Sun className="h-16 w-16 text-yellow-400" />
        </div>

        {/* Animated Clouds */}
        <div className="absolute -top-10 -left-32 animate-bounce [animation-delay:200ms]">
          <CloudRain className="h-12 w-12 text-blue-300" />
        </div>

        {/* Animated Wind */}
        <div className="absolute top-5 right-20 animate-pulse [animation-delay:400ms]">
          <Wind className="h-10 w-10 text-gray-300" />
        </div>

        {/* Main Loading Content */}
        <div className="bg-white rounded-2xl shadow-2xl p-12 min-w-[400px]">
          {/* Animated Sprout Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative h-20 w-20">
              {/* Growing animation */}
              <div className="absolute inset-0 flex items-end justify-center">
                <div className="w-1 h-[60px] bg-green-600 animate-grow origin-bottom"></div>
              </div>
              
              {/* Bouncing sprout */}
              <div className="relative animate-bounce">
                <Sprout className="h-20 w-20 text-green-600" />
              </div>
            </div>
          </div>

          {/* Text Content */}
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold text-gray-800">
              Farm Management System
            </h1>
            <p className="text-gray-600 text-lg">
              Hệ thống quản lý trang trại thông minh
            </p>

            {/* Loading Dots */}
            <div className="flex justify-center items-center space-x-2 py-4">
              <div className="w-3 h-3 bg-green-600 rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-green-600 rounded-full animate-bounce [animation-delay:200ms]"></div>
              <div className="w-3 h-3 bg-green-600 rounded-full animate-bounce [animation-delay:400ms]"></div>
            </div>

            <p className="text-sm text-gray-500">
              Đang tải dữ liệu...
            </p>
          </div>

          {/* Decorative Leaves */}
          <div className="flex justify-around mt-6 opacity-30">
            <Leaf className="h-6 w-6 text-green-500 animate-spin [animation-duration:3s]" />
            <Leaf className="h-6 w-6 text-green-500 animate-spin [animation-duration:4s] [animation-delay:500ms]" />
            <Leaf className="h-6 w-6 text-green-500 animate-spin [animation-duration:3.5s] [animation-delay:1s]" />
          </div>
        </div>

        {/* Bottom decorative grass */}
        <div className="absolute -bottom-4 left-0 right-0 flex justify-center space-x-1">
          <div className="w-1 h-[15px] bg-green-600 rounded-t-full animate-wave"></div>
          <div className="w-1 h-[22px] bg-green-600 rounded-t-full animate-wave [animation-delay:100ms]"></div>
          <div className="w-1 h-[18px] bg-green-600 rounded-t-full animate-wave [animation-delay:200ms]"></div>
          <div className="w-1 h-[25px] bg-green-600 rounded-t-full animate-wave [animation-delay:300ms]"></div>
          <div className="w-1 h-[20px] bg-green-600 rounded-t-full animate-wave [animation-delay:400ms]"></div>
          <div className="w-1 h-[16px] bg-green-600 rounded-t-full animate-wave [animation-delay:500ms]"></div>
          <div className="w-1 h-[23px] bg-green-600 rounded-t-full animate-wave [animation-delay:600ms]"></div>
          <div className="w-1 h-[19px] bg-green-600 rounded-t-full animate-wave [animation-delay:700ms]"></div>
          <div className="w-1 h-[21px] bg-green-600 rounded-t-full animate-wave [animation-delay:800ms]"></div>
          <div className="w-1 h-[17px] bg-green-600 rounded-t-full animate-wave [animation-delay:900ms]"></div>
          <div className="w-1 h-[24px] bg-green-600 rounded-t-full animate-wave [animation-delay:1s]"></div>
          <div className="w-1 h-[20px] bg-green-600 rounded-t-full animate-wave [animation-delay:1.1s]"></div>
          <div className="w-1 h-[18px] bg-green-600 rounded-t-full animate-wave [animation-delay:1.2s]"></div>
          <div className="w-1 h-[22px] bg-green-600 rounded-t-full animate-wave [animation-delay:1.3s]"></div>
          <div className="w-1 h-[16px] bg-green-600 rounded-t-full animate-wave [animation-delay:1.4s]"></div>
          <div className="w-1 h-[25px] bg-green-600 rounded-t-full animate-wave [animation-delay:1.5s]"></div>
          <div className="w-1 h-[19px] bg-green-600 rounded-t-full animate-wave [animation-delay:1.6s]"></div>
          <div className="w-1 h-[21px] bg-green-600 rounded-t-full animate-wave [animation-delay:1.7s]"></div>
          <div className="w-1 h-[23px] bg-green-600 rounded-t-full animate-wave [animation-delay:1.8s]"></div>
          <div className="w-1 h-[17px] bg-green-600 rounded-t-full animate-wave [animation-delay:1.9s]"></div>
        </div>
      </div>
    </div>
  );
};
