import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import { useAuth } from '../../hooks/auth/useAuth'

export default function AppLayout() {
  const { user } = useAuth()

  // Get initials for the avatar based on full name
  const getInitials = () => {
    if (!user?.fullName) return 'U'
    const names = user.fullName.split(' ')
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase()
    }
    return names[0][0].toUpperCase()
  }

  const [active, setActive] = useState('dashboard')

  return (
    <div className="flex w-full min-h-screen bg-gray-50">
      <Sidebar active={active} setActive={setActive} variant="wide" />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden ml-64">
        <header className="h-16 border-b border-gray-200 bg-white px-8 flex items-center shrink-0">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              {/* Added a placeholder or logo if needed, but for now just empty space as requested */}
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-gray-900">{user?.fullName}</p>
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
