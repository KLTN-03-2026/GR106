import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface RoleRouteProps {
  allowedRoles: string[];
  redirectTo?: string;
}

export const RoleRoute: React.FC<RoleRouteProps> = ({ 
  allowedRoles, 
  redirectTo = '/unauthorized' 
}) => {
  const { user, isAuthenticated } = useAuth();

  // Chưa đăng nhập → về login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Không có user info → về login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Kiểm tra role có trong danh sách cho phép không
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
};
