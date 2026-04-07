import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { LogOut, Home, Users, Settings, BarChart3 } from 'lucide-react';

export const OwnerDashboardPage: React.FC = () => {
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
            <h1 className="text-2xl font-bold text-gray-900">Dashboard - Chủ Trang Trại</h1>
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
            Quyền truy cập: Toàn bộ hệ thống
          </h2>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800">
              ✓ Bạn có quyền truy cập tất cả các chức năng của hệ thống
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <Home className="h-12 w-12 text-blue-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Quản lý trang trại</h3>
            <p className="text-gray-600 text-sm">Quản lý thông tin trang trại, khu vực, vật nuôi</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <Users className="h-12 w-12 text-green-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Quản lý nhân viên</h3>
            <p className="text-gray-600 text-sm">Thêm, sửa, xóa nhân viên và phân quyền</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <BarChart3 className="h-12 w-12 text-purple-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Báo cáo & Thống kê</h3>
            <p className="text-gray-600 text-sm">Xem báo cáo chi tiết và phân tích dữ liệu</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <Settings className="h-12 w-12 text-gray-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Cài đặt hệ thống</h3>
            <p className="text-gray-600 text-sm">Cấu hình hệ thống và tùy chọn nâng cao</p>
          </div>
        </div>
      </main>
    </div>
  );
};
