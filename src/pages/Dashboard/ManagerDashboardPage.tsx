import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { LogOut, ClipboardList, Users, BarChart3 } from 'lucide-react';

export const ManagerDashboardPage: React.FC = () => {
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
            <h1 className="text-2xl font-bold text-gray-900">Dashboard - Quản Lý</h1>
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
            Quyền truy cập: Quản lý và giám sát
          </h2>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800">
              ✓ Bạn có quyền quản lý nhân viên, theo dõi công việc và xem báo cáo
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <ClipboardList className="h-12 w-12 text-blue-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Quản lý công việc</h3>
            <p className="text-gray-600 text-sm">Phân công và theo dõi tiến độ công việc</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <Users className="h-12 w-12 text-green-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Quản lý nhân viên</h3>
            <p className="text-gray-600 text-sm">Xem danh sách và theo dõi hoạt động nhân viên</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <BarChart3 className="h-12 w-12 text-purple-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Báo cáo</h3>
            <p className="text-gray-600 text-sm">Xem báo cáo và số liệu thống kê</p>
          </div>
        </div>
      </main>
    </div>
  );
};
