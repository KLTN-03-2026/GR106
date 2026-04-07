import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ShieldAlert } from 'lucide-react';

export const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGoBack = () => {
    // Redirect về trang phù hợp với role
    switch (user?.role) {
      case 'owner':
        navigate('/dashboard/owner');
        break;
      case 'manager':
        navigate('/dashboard/manager');
        break;
      case 'employee':
        navigate('/dashboard/employee');
        break;
      default:
        navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
        <ShieldAlert className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Không có quyền truy cập
        </h1>
        <p className="text-gray-600 mb-6">
          Bạn không có quyền truy cập vào trang này.
          {user?.role && (
            <span className="block mt-2 font-semibold">
              Vai trò hiện tại: {user.role}
            </span>
          )}
        </p>
        <button
          onClick={handleGoBack}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Quay lại trang chủ
        </button>
      </div>
    </div>
  );
};
