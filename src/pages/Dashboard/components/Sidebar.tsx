import {
  LayoutDashboard,
  Sprout,
  Tractor,
  Wheat,
  CloudSun,
  Store,
  Settings,
  LogOut,
  KeyRound,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../hooks/useAuth'
import LogoBrowser from '../../../assets/Logo-browser.png'

const navItems = [
  {
    name: 'Dashboard',
    icon: LayoutDashboard,
    active: true,
    path: '/dashboard',
    roles: ['owner', 'manager', 'employee'],
  },
  {
    name: 'Cây trồng của tôi',
    icon: Sprout,
    active: false,
    path: '#',
    roles: ['owner', 'manager', 'employee'],
  },
  {
    name: 'Vật nuôi',
    icon: Tractor,
    active: false,
    path: '#',
    roles: ['owner', 'manager', 'employee'],
  },
  {
    name: 'Thu hoạch',
    icon: Wheat,
    active: false,
    path: '#',
    roles: ['owner', 'manager', 'employee'],
  },
  {
    name: 'Thời tiết',
    icon: CloudSun,
    active: false,
    path: '#',
    roles: ['owner', 'manager', 'employee'],
  },
  {
    name: 'Chợ nông sản',
    icon: Store,
    active: false,
    path: '#',
    roles: ['owner', 'manager'],
  },
  {
    name: 'Cài đặt',
    icon: Settings,
    active: false,
    path: '#',
    roles: ['owner', 'manager'],
  },
]

export function Sidebar() {
  const navigate = useNavigate()
  const { logout, user } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleChangePassword = () => {
    navigate('/change-password')
  }

  // Filter items based on user role
  const filteredNavItems = navItems.filter(item => 
    !item.roles || (user?.role && item.roles.includes(user.role))
  )

  return (
    <aside className="w-64 h-screen bg-white border-r border-gray-100 flex flex-col fixed left-0 top-0 z-10">
      <div className="p-5 flex items-center gap-2 border-b border-gray-50">
        <img
          src={LogoBrowser}
          alt="FarmerAI Logo"
          className="w-10 h-10 object-contain"
        />
        <span className="font-prompt font-extrabold text-2xl leading-none bg-gradient-to-r from-emerald-800 to-emerald-500 bg-clip-text text-transparent">
          FarmerAI
        </span>
      </div>

      <nav className="flex-1 px-4 py-3 space-y-1">
        {filteredNavItems.map((item) => {
          const Icon = item.icon
          return (
            <a
              key={item.name}
              href={item.path}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${
                item.active
                  ? 'bg-emerald-50 text-emerald-600 font-medium'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon
                className={`w-5 h-5 ${
                  item.active ? 'text-emerald-600' : 'text-gray-400'
                }`}
              />
              <span className="text-sm">{item.name}</span>
            </a>
          )
        })}
      </nav>

      <div className="px-4 py-2 space-y-1 border-t border-gray-100">
        <button
          onClick={handleChangePassword}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-500 hover:bg-gray-50 hover:text-emerald-600 rounded-lg transition-all duration-200"
        >
          <KeyRound className="w-5 h-5 text-gray-400" />
          <span className="text-sm font-medium">Đổi mật khẩu</span>
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all duration-200"
        >
          <LogOut className="w-5 h-5 text-gray-400" />
          <span className="text-sm font-medium">Đăng xuất</span>
        </button>
      </div>

      <div className="p-4 m-4 bg-emerald-50 rounded-xl border border-emerald-100">
        <div className="flex items-center gap-3 mb-2">
          <CloudSun className="w-5 h-5 text-emerald-600" />
          <span className="text-xs font-semibold text-emerald-900 uppercase tracking-wider">Thời tiết</span>
        </div>
        <div className="text-2xl font-bold text-emerald-700">24°C</div>
        <div className="text-sm text-emerald-600 mt-1 font-medium">
          Nhiều mây • Độ ẩm 65%
        </div>
      </div>
    </aside>
  )
}
