import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const PublicRoutes: React.FC = () => {
  const { isAuthenticated } = useAuth();
  // If already authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // Otherwise, allow the user to see the public page (Login/Register)
  return <Outlet />;
};