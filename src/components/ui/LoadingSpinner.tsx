import React from 'react';
import { Tractor } from 'lucide-react';

/**
 * Simple spinner component với icon Tractor
 * Dùng cho loading state trong component nhỏ
 */
export const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg'; text?: string }> = ({ 
  size = 'md',
  text = 'Đang tải...'
}) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-12 w-12',
    lg: 'h-20 w-20'
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="relative">
        {/* Rotating circle */}
        <div className="absolute inset-0 border-4 border-green-200 rounded-full animate-spin border-t-green-600"></div>
        
        {/* Tractor icon in center */}
        <div className={`${sizeClasses[size]} flex items-center justify-center`}>
          <Tractor className="h-2/3 w-2/3 text-green-600" />
        </div>
      </div>
      
      {text && (
        <p className="mt-4 text-gray-600 text-sm animate-pulse">{text}</p>
      )}
    </div>
  );
};

/**
 * Inline loading cho button hoặc inline element
 */
export const InlineLoadingSpinner: React.FC = () => {
  return (
    <div className="inline-flex items-center">
      <svg
        className="animate-spin h-4 w-4 text-green-600"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    </div>
  );
};
