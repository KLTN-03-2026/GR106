import React from "react";
import { Navigate } from "react-router-dom";
import { hasRole } from "../utils/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const token = localStorage.getItem("token");
  if (!token || !hasRole(token, requiredRole)) {
    return <Navigate to="/login"
    
     />;
  }
  return <>{children}</>;
};

export default ProtectedRoute;