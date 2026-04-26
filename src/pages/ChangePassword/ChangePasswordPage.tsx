import React from 'react';
import { ChangePasswordForm } from '@/components/auth/ChangePasswordForm';
import { motion } from 'framer-motion';

export const ChangePasswordPage: React.FC = () => {
  return (
    <div className="h-full flex items-center justify-center py-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-gray-100 p-10"
      >
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">
            Đổi mật khẩu
          </h1>
          <p className="text-gray-500 font-medium">
            Cập nhật mật khẩu để bảo vệ tài khoản của bạn
          </p>
        </div>
        
        <ChangePasswordForm />
      </motion.div>
    </div>
  );
};