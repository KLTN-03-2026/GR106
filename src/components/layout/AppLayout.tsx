import { Outlet } from 'react-router-dom'
import { Sidebar } from '../../pages/Dashboard/components/Sidebar'
import { useAuth } from '../../hooks/useAuth'

export default function AppLayout() {
  const { user } = useAuth()
  
  // Get initials for the avatar (CT for Owner, QL for Manager, NC for Worker)
  const getInitials = () => {
    if (!user) return '??'
    switch (user.role) {
      case 'owner': return 'CT'
      case 'manager': return 'QL'
      case 'employee': return 'NC'
      default: return 'U'
    }
  }

  const getRoleLabel = () => {
    switch (user?.role) {
      case 'owner': return 'Chủ trang trại'
      case 'manager': return 'Quản lý trang trại'
      case 'employee': return 'Nhân công'
      default: return 'Thành viên'
    }
  }

  return (
    <div className="flex w-full min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden ml-64">
        <header className="h-16 border-b border-gray-200 bg-white px-8 flex items-center shrink-0">
          <div className="flex items-center justify-between w-full">
            <h1 className="text-xl font-bold text-emerald-800">
              FarmerAI - Hệ sinh thái thông minh
            </h1>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-gray-900">{getRoleLabel()}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center border-2 border-emerald-50 shadow-sm transition-transform hover:scale-105 cursor-pointer">
                <span className="text-emerald-700 font-bold text-sm">
                  {getInitials()}
                </span>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
