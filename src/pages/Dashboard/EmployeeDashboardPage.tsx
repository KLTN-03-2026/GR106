import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { LogOut, ClipboardCheck, FileText } from 'lucide-react';

export const EmployeeDashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard - Nhân Viên</h1>
            <p className="text-sm text-gray-600">Xin chào, {user?.fullName}</p>
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Đăng xuất
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Quyền truy cập: Thực hiện công việc
          </h2>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800">
              ✓ Bạn có quyền xem và thực hiện công việc được giao
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <ClipboardCheck className="h-12 w-12 text-green-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Công việc của tôi</h3>
            <p className="text-gray-600 text-sm">Xem danh sách công việc được giao và cập nhật tiến độ</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <FileText className="h-12 w-12 text-blue-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Báo cáo công việc</h3>
            <p className="text-gray-600 text-sm">Gửi báo cáo về công việc đã thực hiện</p>
          </div>
        </div>
      </main>
    </div>
  );
};
