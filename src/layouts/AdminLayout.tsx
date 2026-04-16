import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Sprout, LayoutDashboard, LogOut, ChevronLeft } from "lucide-react";
import { useDispatch } from "react-redux";
import { logout } from "../store/authSlice";

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const navItems = [
    {
      name: "Dashboard",
      path: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Danh mục cây trồng",
      path: "/admin/crop-catalog",
      icon: Sprout,
    },
  ];

  return (
    <div className="w-full h-screen bg-[#F8FAFC] flex overflow-hidden">
      {/* Admin Sidebar - Dark Green Theme */}
      <aside className="w-72 bg-[#1A3020] flex flex-col shadow-2xl">
        <div className="p-8 flex items-center gap-4">
          <div className="w-12 h-12 bg-[#25422D] rounded-xl flex items-center justify-center border border-white/10 shadow-lg">
            <Sprout className="w-7 h-7 text-green-400 group-hover:rotate-12 transition-transform" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg text-white leading-tight">Quản trị</span>
            <span className="text-xs text-green-400/80 font-medium uppercase tracking-widest">Hệ thống</span>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-6">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl transition-all duration-300 ${
                  isActive
                    ? "bg-[#3E6B47] text-white font-bold shadow-lg shadow-black/20 translate-x-1"
                    : "text-green-100/60 hover:text-white hover:bg-white/5 active:scale-95"
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? "text-green-300" : "opacity-70 text-green-100"}`} />
                <span className="tracking-wide">{item.name}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-6 border-t border-white/5 mb-2">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl text-red-400 hover:bg-red-500/10 transition-all font-medium active:scale-95 group"
          >
            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="tracking-wide">Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header - Only visible on Dashboard */}
        {location.pathname === "/admin/dashboard" && (
          <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-10 shadow-sm z-10">
            <div className="flex items-center gap-6">
              <button 
                onClick={() => navigate(-1)}
                className="group p-2.5 hover:bg-slate-50 border border-slate-100 rounded-xl transition-all text-slate-400 hover:text-slate-600 active:scale-90"
              >
                <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
              </button>
            </div>
            
            {/* User Profile Pill */}
            <div className="flex items-center p-1.5 pr-5 bg-white border border-slate-200 rounded-full shadow-sm">
              <div className="w-10 h-10 rounded-full bg-[#3E6B47] flex items-center justify-center text-white font-black text-sm shadow-inner mr-3 group overflow-hidden relative">
                <span className="relative z-10">AD</span>
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-black text-slate-900 leading-none mb-0.5">Administrator</span>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wide">Hệ quản trị toàn cục</span>
              </div>
            </div>
          </header>
        )}

        {/* Page Content - Full Width Minimalist */}
        <div className="flex-1 overflow-y-auto bg-white">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
