import React from 'react';
import { AuthLayout } from '../../components/AuthLayout';
import { ChangePasswordForm } from './components/ChangePasswordForm';
export const ChangePasswordPage: React.FC = () => {
  return (
    <AuthLayout
      title="Đổi mật khẩu"
      subtitle="Cập nhật mật khẩu để bảo vệ tài khoản của bạn">
      
      <ChangePasswordForm />
    </AuthLayout>);

};