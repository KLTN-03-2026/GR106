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
  Trees,
  Key,
  Zap,
  Wallet,
  GitFork,
  Sparkles,
} from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "../../utils/cn";
import { useAuth } from "../../hooks/useAuth";
import { NAV_ICONS } from "../../layouts/NavIcon";
import { useCurrentSubscription } from "../../hooks/subscription/useSubscription";
import { getRoleDisplayName } from "../../utils/roleUtils";
import { useSelector } from "react-redux";
import { RootState } from "../../store";

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
    title: "TIỆN ÍCH",
    items: [
      { key: "wallet", label: "Ví & Thanh toán", icon: Wallet },
      { key: "activity", label: "Hoạt động", icon: Activity },
      { key: "task", label: "Nhiệm vụ", icon: GitFork },
      { key: "gemini", label: "Trợ lý AI", icon: Sparkles },
    ]
  },
  {
    title: "QUẢN LÝ",
    items: [
      { key: "map", label: "Bản đồ nông trại", icon: MapIcon },
      { key: "land-plots", label: "Lô đất & Cây trồng", icon: Grid3X3 },
      { key: "crop-catalog", label: "Danh mục cây trồng", icon: Trees },
      { key: "season-plans", label: "Kế hoạch mùa vụ", icon: Zap },
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
  const { logout, user, currentFarmId } = useAuth();
  const { farmSummary } = useSelector((state: RootState) => state.farm);
  const { data: currentSubscription, isLoading: loadingSub } = useCurrentSubscription();
  
  const currentFarm = currentFarmId ? farmSummary.find((f: any) => f.farmId === currentFarmId) : null;

  if (variant === "compact") {
    return (
      <aside className="flex flex-col items-center justify-between w-[64px] bg-white shrink-0 rounded-[24px] shadow-sm border border-slate-100 py-6 px-2 transition-all duration-300">
        <div className="flex flex-col items-center gap-6 w-full">
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

          {NAV_ICONS
            .filter(item => item.key !== "season-plans" || !!currentFarmId)
            .map(({ icon: Icon, key }) => (
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

        <div className="flex flex-col items-center gap-4 w-full">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setActive("change-password")}
            className={cn(
              "w-10 h-10 rounded-xl p-0 transition-all duration-200",
              active === "change-password" ? "bg-slate-900 text-white shadow-md" : "hover:bg-gray-100 text-slate-500"
            )}
          >
            <Key size={22} color={active === "change-password" ? "#fff" : "#374151"} strokeWidth={2} />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={logout}
            className="w-10 h-10 rounded-xl p-0 hover:bg-red-50 hover:text-red-500 transition-colors"
          >
            <LogOut size={22} color="#374151" strokeWidth={2} />
          </Button>
        </div>
      </aside>
    );
  }

  return (
    <aside className="flex flex-col h-full w-[250px] bg-white shrink-0 rounded-[32px] shadow-sm border border-slate-200 p-2 transition-all duration-300 overflow-hidden">
      {/* Brand Label - Ultra Compact */}
      <div className="flex items-center gap-2 px-3 py-1.5 mb-0.5 shrink-0">
        <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center text-slate-800 border border-slate-200 shrink-0">
          <Trees size={18} />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-[15px] font-black text-slate-800 tracking-tight leading-tight truncate">
              {currentFarm ? currentFarm.farmName : "FarmarAI"}
            </h2>
            {!loadingSub && currentSubscription && (
              <span className="px-2 py-0.5 rounded-md bg-slate-900 text-[9px] font-black text-white uppercase tracking-wider whitespace-nowrap">
                {currentSubscription.subscriptionPlanName}
              </span>
            )}
          </div>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate opacity-80">
            {currentFarm ? (currentFarm.description || "Trang trại của tôi") : "Quản lý nông trại"}
          </p>
        </div>
      </div>

      {/* Navigation Groups — hiển thị đầy đủ, không scroll */}
      <nav className="flex-1 flex flex-col gap-2 shrink-0">
        {NAV_GROUPS.map((group) => (
          <div key={group.title} className="flex flex-col gap-0">
            <h3 className="px-4 text-[7px] font-black text-slate-400 uppercase tracking-[2px] mb-0.5 opacity-70">
              {group.title}
            </h3>
            <div className="flex flex-col gap-0.5">
              {group.items
                .filter(item => item.key !== "season-plans" || !!currentFarmId)
                .map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setActive(item.key)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-1.5 rounded-xl transition-all duration-200 group font-semibold text-[14.5px] whitespace-nowrap",
                      active === item.key
                        ? "bg-emerald-50 text-emerald-600 shadow-sm font-bold"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    <item.icon
                      size={18}
                      className={cn(
                        "transition-colors shrink-0",
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

      {/* User Profile - Ultra Compact */}
      <div className="mt-auto pt-1.5 border-t border-slate-100 flex flex-col shrink-0">
        <div className="flex items-center gap-2 px-3 pb-1">
          <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-[9px] border-2 border-white shadow-sm shrink-0">
            {((!user?.fullName || user.fullName === 'Thành viên') ? getRoleDisplayName(user?.role) : user.fullName).split(" ").pop()?.charAt(0) || "U"}
          </div>
          <div className="flex-1 overflow-hidden ml-1">
            <h4 className="text-[11px] font-black text-slate-800 truncate leading-tight">
              {(!user?.fullName || user.fullName === 'Thành viên')
                ? getRoleDisplayName(user?.role || '')
                : user.fullName}
            </h4>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setActive("change-password")}
            className={cn(
              "w-8 h-8 rounded-xl p-0 transition-all duration-200 shrink-0",
              active === "change-password" ? "bg-slate-900 text-white" : "hover:bg-gray-100 text-slate-500"
            )}
          >
            <Key size={16} color={active === "change-password" ? "#fff" : "#374151"} strokeWidth={2} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={logout}
            className="w-8 h-8 rounded-xl p-0 hover:bg-red-50 hover:text-red-500 transition-colors shrink-0"
          >
            <LogOut size={16} color="#374151" strokeWidth={2} />
          </Button>
        </div>
      </div>
    </aside>
  );
}