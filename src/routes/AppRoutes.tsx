import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PublicRoutes } from './PublicRoutes';
import { PrivateRoutes } from './PrivateRoutes';
import { RoleRoute } from './RoleRoute';
import { LoadingPage } from '../components/ui/LoadingPage';

// Pages
const HomePage = lazy(() => import('../pages/landing/HomePage'));
const LoginPage = lazy(() => import('../pages/Login/LoginPage').then(module => ({ default: module.LoginPage })));
const RegisterPage = lazy(() => import('../pages/Register/RegisterPage').then(module => ({ default: module.RegisterPage })));
const VerifyEmailPage = lazy(() => import('../pages/VerifyEmail/VerifyEmailPage').then(module => ({ default: module.VerifyEmailPage })));
const ForgotPasswordPage = lazy(() => import('../pages/ForgotPassword/ForgotPasswordPage').then(module => ({ default: module.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import('../pages/ResetPassword/ResetPasswordPage').then(module => ({ default: module.ResetPasswordPage })));
const ChangePasswordPage = lazy(() => import('../pages/ChangePassword/ChangePasswordPage').then(module => ({ default: module.ChangePasswordPage })));
const DashboardPage = lazy(() => import('../pages/Dashboard/DashboardPage').then(module => ({ default: module.DashboardPage })));
const UnauthorizedPage = lazy(() => import('../pages/landing/UnauthorizedPage').then(module => ({ default: module.UnauthorizedPage })));
const MembersPage = lazy(() => import('../pages/members/MembersPage').then(module => ({ default: module.MembersPage })));
const InviteExpiredPage = lazy(() => import('../pages/invite-expired/InviteExpiredPage').then(module => ({ default: module.InviteExpiredPage })));

// Layouts
const AppLayout = lazy(() => import('@/components/layout/AppLayout'));

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Landing Page - Luôn là trang đầu tiên khi truy cập root */}
      <Route path="/" element={<Suspense fallback={<LoadingPage />}><HomePage /></Suspense>} />

      {/* Public Routes - Chỉ dành cho các trang Auth */}
      <Route element={<PublicRoutes />}>
        <Route path="/login" element={<Suspense fallback={<LoadingPage />}><LoginPage /></Suspense>} />
        <Route path="/register" element={<Suspense fallback={<LoadingPage />}><RegisterPage /></Suspense>} />
        <Route path="/forgot-password" element={<Suspense fallback={<LoadingPage />}><ForgotPasswordPage /></Suspense>} />
        <Route path="/reset-password" element={<Suspense fallback={<LoadingPage />}><ResetPasswordPage /></Suspense>} />
        <Route path="/verify-email" element={<Suspense fallback={<LoadingPage />}><VerifyEmailPage /></Suspense>} />
        <Route path="/invite/expired" element={<Suspense fallback={<LoadingPage />}><InviteExpiredPage /></Suspense>} />
      </Route>

      {/* Private Routes - Cần đăng nhập và sử dụng AppLayout */}
      <Route element={<PrivateRoutes />}>
        <Route element={<Suspense fallback={<LoadingPage />}><AppLayout /></Suspense>}>
          <Route path="/dashboard" element={<Suspense fallback={<LoadingPage />}><DashboardPage /></Suspense>} />
          <Route path="/change-password" element={<Suspense fallback={<LoadingPage />}><ChangePasswordPage /></Suspense>} />
          
          {/* Role-based Routes */}
          <Route element={<RoleRoute allowedRoles={['owner']} />}>
            <Route path="/members" element={<Suspense fallback={<LoadingPage />}><MembersPage /></Suspense>} />
          </Route>

          {/* Placeholder for future features */}
          <Route path="/tasks" element={<div className="p-8 font-bold">Quản lý Công việc (Sắp có)</div>} />
          <Route path="/crops" element={<div className="p-8 font-bold">Quản lý Cây trồng (Sắp có)</div>} />
        </Route>
      </Route>

      {/* Unauthorized Page */}
      <Route path="/unauthorized" element={<Suspense fallback={<LoadingPage />}><UnauthorizedPage /></Suspense>} />

      {/* Fallback Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};