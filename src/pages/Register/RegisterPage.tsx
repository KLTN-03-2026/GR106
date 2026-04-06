import React from 'react';
import { AuthLayout } from '../../components/AuthLayout';
import { RegisterForm } from './components/RegisterForm';
export const RegisterPage: React.FC = () => {
  return (
    <AuthLayout
      title="Tạo tài khoản mới"
      subtitle="Bắt đầu quản lý trang trại của bạn ngay hôm nay">
      
      <RegisterForm />
    </AuthLayout>);

};