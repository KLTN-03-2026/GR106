import { Search, Bell } from 'lucide-react'
import { useAuth } from '../../../hooks/useAuth'

export function Header() {
  const { user } = useAuth()
  const today = new Date().toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-10">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Chào buổi sáng, {user?.fullName || 'Farmer'}!
        </h1>
        <p className="text-sm text-gray-500 mt-1 capitalize">{today}</p>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm kiếm cây trồng, tác vụ..."
            className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all w-64"
          />
        </div>

        <button className="relative p-2 text-gray-400 hover:text-emerald-600 transition-colors rounded-full hover:bg-emerald-50">
          <Bell className="w-6 h-6" />
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
        </button>

        <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
          <img
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80"
            alt="Profile"
            className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
          />
          <div className="hidden md:block text-right">
            <p className="text-sm font-bold text-gray-900 leading-tight">
              {user?.role === 'owner' ? 'Chủ trang trại' : 
               user?.role === 'manager' ? 'Quản lý trang trại' : 
               'Nhân công'}
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}
