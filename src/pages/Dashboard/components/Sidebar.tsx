import { NavLink, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { 
  LayoutDashboard, 
  Users, 
  ClipboardList, 
  Sprout, 
  LogOut, 
  KeyRound 
} from 'lucide-react'
import { useAuth } from '../../../hooks/useAuth'
import { setRole } from '../../../store/authSlice'
import LogoBrowser from '../../../assets/Logo-browser.png'

export function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const navItems = [
    {
      to: '/dashboard',
      icon: LayoutDashboard,
      label: 'Tổng quan',
      roles: ['owner', 'manager', 'employee'],
    },
    {
      to: '/members',
      icon: Users,
      label: 'Thành viên',
      roles: ['owner'],
    },
    {
      to: '/tasks',
      icon: ClipboardList,
      label: 'Công việc',
      roles: ['owner', 'manager', 'employee'],
    },
    {
      to: '/crops',
      icon: Sprout,
      label: 'Cây trồng',
      roles: ['owner', 'manager', 'employee'],
    },
  ]

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleChangePassword = () => {
    navigate('/change-password')
  }

  const handleRoleSwitch = (newRole: string) => {
    dispatch(setRole(newRole))
    window.location.reload()
  }

  // Filter items based on user role
  const filteredNavItems = navItems.filter(item => 
    !item.roles || (user?.role && item.roles.includes(user.role))
  )

  return (
    <aside className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col fixed left-0 top-0 h-full z-20">
      <div 
        className="h-16 border-b border-gray-200 flex items-center px-6 cursor-pointer hover:bg-gray-100/50 transition-colors"
        onClick={() => navigate("/")}
      >
        <div className="flex items-center gap-2">
          <img
            src={LogoBrowser}
            alt="FarmerAI Logo"
            className="w-8 h-8 object-contain"
          />
          <span className="font-bold text-lg text-gray-900 bg-gradient-to-r from-emerald-800 to-emerald-500 bg-clip-text text-transparent">
            FarmerAI
          </span>
        </div>
      </div>
      
      <nav className="flex-1 px-3 py-6">
        <ul className="space-y-1">
          {filteredNavItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-emerald-50 text-emerald-700 font-medium' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                <item.icon className={`w-5 h-5 ${item.to === window.location.pathname ? 'text-emerald-700' : 'text-gray-500'}`} />
                <span className="font-medium text-sm">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Developer Role Switcher (Test only) */}
      <div className="px-3 py-4 border-t border-gray-200 bg-gray-100/50">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-3">
          Chế độ Test: Đổi quyền
        </p>
        <div className="flex flex-wrap gap-1 px-1">
          <button
            onClick={() => handleRoleSwitch('owner')}
            className={`px-2 py-1 text-[10px] rounded border transition-all ${
              user?.role === 'owner' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-500'
            }`}
          >
            Owner
          </button>
          <button
            onClick={() => handleRoleSwitch('manager')}
            className={`px-2 py-1 text-[10px] rounded border transition-all ${
              user?.role === 'manager' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-500'
            }`}
          >
            Manager
          </button>
          <button
            onClick={() => handleRoleSwitch('employee')}
            className={`px-2 py-1 text-[10px] rounded border transition-all ${
              user?.role === 'employee' ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-600 border-gray-200 hover:border-purple-500'
            }`}
          >
            Worker
          </button>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="px-3 py-4 border-t border-gray-200 space-y-1">
        <button
          onClick={handleChangePassword}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <KeyRound className="w-5 h-5 text-gray-500" />
          <span className="text-sm font-medium">Đổi mật khẩu</span>
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5 text-red-500" />
          <span className="text-sm font-medium">Đăng xuất</span>
        </button>
      </div>
    </aside>
  )
}
