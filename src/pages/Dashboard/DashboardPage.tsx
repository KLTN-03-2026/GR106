import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Key, Sprout } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
export const DashboardPage: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-emerald-600 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Sprout className="h-8 w-8 text-white" />
              <span className="ml-2 text-white text-lg font-semibold">
                Farm Management
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/change-password')}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-emerald-100 hover:text-white hover:bg-emerald-500 focus:outline-none transition-colors">
                
                <Key className="h-4 w-4 mr-2" />
                Đổi mật khẩu
              </button>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-emerald-100 hover:text-white hover:bg-emerald-500 focus:outline-none transition-colors">
                
                <LogOut className="h-4 w-4 mr-2" />
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex items-center">
            <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
              <User className="h-6 w-6 text-emerald-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Bảng điều khiển
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Chào mừng bạn đến với hệ thống quản lý trang trại.
              </p>
            </div>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
            <dl className="sm:divide-y sm:divide-gray-200">
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  Trạng thái
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    Đang hoạt động
                  </span>
                </dd>
              </div>
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Vai trò</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  Chủ trang trại
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </main>
    </div>);

};