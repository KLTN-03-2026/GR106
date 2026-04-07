import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PublicRoutes } from './PublicRoutes';
import { PrivateRoutes } from './PrivateRoutes';
import { RoleRoute } from './RoleRoute';
import { LoadingPage } from '../components/ui/LoadingPage';

// Lazy load pages để thấy loading effect
const HomePage = lazy(() => import('../pages/landing/HomePage'));
const LoginPage = lazy(() => import('../pages/Login/LoginPage').then(module => ({ default: module.LoginPage })));
const RegisterPage = lazy(() => import('../pages/Register/RegisterPage').then(module => ({ default: module.RegisterPage })));
const VerifyEmailPage = lazy(() => import('../pages/VerifyEmail/VerifyEmailPage').then(module => ({ default: module.VerifyEmailPage })));
const ForgotPasswordPage = lazy(() => import('../pages/ForgotPassword/ForgotPasswordPage').then(module => ({ default: module.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import('../pages/ResetPassword/ResetPasswordPage').then(module => ({ default: module.ResetPasswordPage })));
const ChangePasswordPage = lazy(() => import('../pages/ChangePassword/ChangePasswordPage').then(module => ({ default: module.ChangePasswordPage })));
const DashboardPage = lazy(() => import('../pages/Dashboard/DashboardPage').then(module => ({ default: module.DashboardPage })));
const UnauthorizedPage = lazy(() => import('../pages/landing/UnauthorizedPage').then(module => ({ default: module.UnauthorizedPage })));

// Role-based Dashboard Pages
const OwnerDashboardPage = lazy(() => import('../pages/Dashboard/OwnerDashboardPage').then(module => ({ default: module.OwnerDashboardPage })));
const ManagerDashboardPage = lazy(() => import('../pages/Dashboard/ManagerDashboardPage').then(module => ({ default: module.ManagerDashboardPage })));
const EmployeeDashboardPage = lazy(() => import('../pages/Dashboard/EmployeeDashboardPage').then(module => ({ default: module.EmployeeDashboardPage })));

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicRoutes />}>
        <Route path="/" element={<Suspense fallback={<LoadingPage />}><HomePage /></Suspense>} />
        <Route path="/login" element={<Suspense fallback={<LoadingPage />}><LoginPage /></Suspense>} />
        <Route path="/register" element={<Suspense fallback={<LoadingPage />}><RegisterPage /></Suspense>} />
        <Route path="/forgot-password" element={<Suspense fallback={<LoadingPage />}><ForgotPasswordPage /></Suspense>} />
        <Route path="/reset-password" element={<Suspense fallback={<LoadingPage />}><ResetPasswordPage /></Suspense>} />
        <Route path="/verify-email" element={<Suspense fallback={<LoadingPage />}><VerifyEmailPage /></Suspense>} />
      </Route>

      {/* Private Routes - Cần authentication */}
      <Route element={<PrivateRoutes />}>
        {/* Common routes for all authenticated users */}
        <Route path="/change-password" element={<Suspense fallback={<LoadingPage />}><ChangePasswordPage /></Suspense>} />
        <Route path="/dashboard" element={<Suspense fallback={<LoadingPage />}><DashboardPage /></Suspense>} />
        
        {/* Role-based Routes */}
        {/* Owner Dashboard - Chỉ owner */}
        <Route element={<RoleRoute allowedRoles={['owner']} />}>
          <Route path="/dashboard/owner" element={<Suspense fallback={<LoadingPage />}><OwnerDashboardPage /></Suspense>} />
        </Route>

        {/* Manager Dashboard - Owner và Manager */}
        <Route element={<RoleRoute allowedRoles={['owner', 'manager']} />}>
          <Route path="/dashboard/manager" element={<Suspense fallback={<LoadingPage />}><ManagerDashboardPage /></Suspense>} />
        </Route>

        {/* Employee Dashboard - Tất cả roles */}
        <Route element={<RoleRoute allowedRoles={['owner', 'manager', 'employee']} />}>
          <Route path="/dashboard/employee" element={<Suspense fallback={<LoadingPage />}><EmployeeDashboardPage /></Suspense>} />
        </Route>
      </Route>

      {/* Unauthorized Page */}
      <Route path="/unauthorized" element={<Suspense fallback={<LoadingPage />}><UnauthorizedPage /></Suspense>} />

      {/* Fallback Route */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};