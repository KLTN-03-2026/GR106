import React from 'react';
import { Navigate, Outlet, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/auth/useAuth';

export const PublicRoutes: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const isForced = searchParams.get('force') === 'true';

  // If already authenticated and not forced, redirect to dashboard
  if (isAuthenticated && !isForced) {
    return <Navigate to="/dashboard" replace />;
  }

  // Otherwise, allow the user to see the public page (Login/Register)
  return <Outlet />;
};