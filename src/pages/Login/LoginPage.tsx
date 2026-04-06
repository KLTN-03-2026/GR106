import React from 'react';
import { AuthLayout } from '../../components/AuthLayout';
import { LoginForm } from './components/LoginForm';
export const LoginPage: React.FC = () => {
  return (
    <AuthLayout
      title="Đăng nhập hệ thống"
      subtitle="Quản lý trang trại của bạn một cách hiệu quả">
      
      <LoginForm />
    </AuthLayout>);

};