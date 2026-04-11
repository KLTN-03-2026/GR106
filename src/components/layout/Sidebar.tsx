import { 
  LayoutGrid, 
  LogOut, 
  LayoutDashboard, 
  Activity, 
  Map as MapIcon, 
  Grid3X3, 
  Users, 
  CreditCard, 
  Settings,
  Trees
} from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "../../utils/cn";
import { useAuth } from "../../hooks/useAuth";
import { NAV_ICONS } from "../../layouts/NavIcon";

interface SidebarProps {
  active: string;
  setActive: (key: string) => void;
  variant?: "compact" | "wide";
}

const NAV_GROUPS = [
  {
    title: "TỔNG QUAN",
    items: [
      { key: "tree", label: "Trang trại của tôi", icon: Trees },
      { key: "dashboard", label: "Bảng điều khiển", icon: LayoutDashboard },
      { key: "activity", label: "Theo dõi chỉ số", icon: Activity },
    ]
  },
  {
    title: "QUẢN LÝ",
    items: [
      { key: "map", label: "Bản đồ nông trại", icon: MapIcon },
      { key: "land-plots", label: "Lô đất & Cây trồng", icon: Grid3X3 },
      { key: "members", label: "Thành viên", icon: Users },
    ]
  },
  {
    title: "HỆ THỐNG",
    items: [
      { key: "subscription", label: "Dịch vụ & Gói cước", icon: CreditCard },
      { key: "settings", label: "Cài đặt", icon: Settings },
    ]
  }
];

export default function Sidebar({
  active,
  setActive,
  variant = "compact",
}: SidebarProps) {
  const { logout, user } = useAuth();
  
  if (variant === "compact") {
    return (
      <aside className="flex flex-col items-center justify-between h-full w-[64px] bg-white shrink-0 rounded-[24px] shadow-sm border border-slate-100 py-6 px-2 transition-all duration-300">
        <div className="flex flex-col items-center gap-6 w-full">
          {/* Dashboard Icon */}
          <Button
            onClick={() => setActive("dashboard")}
            variant={active === "dashboard" ? "dark-nav" : "ghost"}
            size="icon"
            className={cn(
              "w-10 h-10 rounded-xl p-0 transition-all duration-200",
              active === "dashboard" ? "bg-slate-900 text-white shadow-md" : "hover:bg-gray-100"
            )}
          >
            <LayoutGrid size={22} color={active === "dashboard" ? "#fff" : "#111827"} strokeWidth={2} />
          </Button>

          {/* Navigation Items */}
          {NAV_ICONS.map(({ icon: Icon, key }) => (
            <Button
              key={key}
              onClick={() => setActive(key)}
              variant={active === key ? "dark-nav" : "ghost"}
              size="icon"
              className={cn(
                "w-10 h-10 rounded-xl p-0 transition-all duration-200",
                active === key ? "bg-slate-900 text-white shadow-md" : "hover:bg-gray-100 text-slate-500"
              )}
            >
              <Icon size={22} color={active === key ? "#fff" : "#374151"} strokeWidth={2} />
            </Button>
          ))}
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={logout}
          className="w-10 h-10 rounded-xl p-0 hover:bg-red-50 hover:text-red-500 transition-colors"
        >
          <LogOut size={22} color="#374151" strokeWidth={2} />
        </Button>
      </aside>
    );
  }

  return (
    <aside className="flex flex-col h-full w-[260px] bg-white shrink-0 rounded-[32px] shadow-sm border border-slate-200 p-4 transition-all duration-300 overflow-hidden">
      {/* Brand Label */}
      <div className="flex items-center gap-3 px-3 py-4 mb-2">
        <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center text-slate-800 border border-slate-200">
          <Trees size={20} />
        </div>
        <div>
          <h2 className="text-sm font-black text-slate-800 tracking-tight leading-tight">FarmOS</h2>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Quản lý nông trại</p>
        </div>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 flex flex-col gap-4 no-scrollbar px-1">
        {NAV_GROUPS.map((group) => (
          <div key={group.title} className="flex flex-col gap-1.5">
            <h3 className="px-4 text-[9px] font-black text-slate-400 uppercase tracking-[2px] mb-0.5">
              {group.title}
            </h3>
            <div className="flex flex-col gap-0.5">
              {group.items.map((item) => (
                <button
                  key={item.key}
                  onClick={() => setActive(item.key)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2.5 rounded-2xl transition-all duration-200 group font-bold text-sm",
                    active === item.key 
                      ? "bg-emerald-50 text-emerald-600 shadow-sm" 
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <item.icon 
                    size={18} 
                    className={cn(
                      "transition-colors",
                      active === item.key ? "text-emerald-600" : "text-slate-400 group-hover:text-slate-900"
                    )} 
                  />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User Profile & Logout */}
      <div className="mt-auto pt-4 border-t border-slate-100 flex flex-col gap-2">
        <div className="flex items-center gap-3 px-2">
          <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs border-2 border-white shadow-sm">
            {user?.fullName?.split(" ").pop()?.charAt(0) || "U"}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-[9px] font-bold text-slate-400 uppercase truncate">Chủ trang trại</p>
          </div>
        </div>
        
        <Button
          variant="ghost"
          onClick={logout}
          className="w-full justify-start gap-3 rounded-2xl h-10 px-4 text-slate-500 hover:text-red-500 hover:bg-red-50 font-bold text-xs group"
        >
          <LogOut size={18} className="text-slate-400 group-hover:text-red-500 transition-colors" />
          <span>Đăng xuất</span>
        </Button>
      </div>
    </aside>
  );
}