import {
  Home,
  BarChart3,
  History,
  Map as MapIcon,
  Grid3X3,
  Users,
  CreditCard,
  Trees,
  Zap,
  Wallet,
  GitFork,
  Sparkles,
  Warehouse,
  Truck,
  Tag,
  Sprout,
} from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "../../utils/cn";
import { useAuth } from "../../hooks/auth/useAuth";
import { useFarms } from "../../hooks/farms/useFarms";

interface SidebarProps {
  active: string;
  setActive: (key: string) => void;
  variant?: "compact" | "wide";
}

const NAV_GROUPS = [
  {
    title: "Tổng quan",
    items: [
      { key: "dashboard", label: "Bảng điều khiển", icon: Home },
      { key: "tree", label: "Trang trại của tôi", icon: Trees, roles: ["owner", "admin", "manager", "employee"] },
      { key: "metrics", label: "Theo dõi chỉ số", icon: BarChart3, roles: ["owner", "admin"] },
    ],
  },
  {
    title: "Tiện ích",
    items: [
      { key: "wallet", label: "Ví & Thanh toán", icon: Wallet, roles: ["owner", "admin"] },
      { key: "activity", label: "Hoạt động", icon: History, roles: ["owner", "admin"] },
      { key: "task", label: "Nhiệm vụ", icon: GitFork, roles: ["owner", "admin", "employee"] },
      { key: "gemini", label: "Trợ lý AI", icon: Sparkles, roles: ["owner", "admin"] },
    ],
  },
  {
    title: "Quản lý",
    items: [
      { key: "map", label: "Bản đồ nông trại", icon: MapIcon, roles: ["owner", "admin"] },
      { key: "land-plots", label: "Lô đất & Cây trồng", icon: Grid3X3, roles: ["owner", "admin"] },
      { key: "crop-catalog", label: "Danh mục cây trồng", icon: Sprout, roles: ["owner", "admin"] },
      { key: "season-plans", label: "Kế hoạch mùa vụ", icon: Zap, roles: ["owner", "manager", "admin"] },
      { key: "warehouses", label: "Kho hàng", icon: Warehouse, roles: ["owner", "manager", "admin"] },
      { key: "suppliers", label: "Nhà cung cấp", icon: Truck, roles: ["owner", "manager", "admin"] },
      { key: "skus", label: "Mã SKU", icon: Tag, roles: ["owner", "manager", "admin"] },
      { key: "members", label: "Thành viên", icon: Users, roles: ["owner", "admin"] },
    ],
  },
];

const FOOTER_ITEMS = [
  { key: "subscription", label: "Gói cước & Dịch vụ", icon: CreditCard, roles: ["owner"] },
];

export default function Sidebar({
  active,
  setActive,
  variant = "compact",
}: SidebarProps) {
  const { user, currentFarmId } = useAuth();
  const { farmSummary, farms } = useFarms();

  const currentFarm = currentFarmId
    ? farms.find((f: any) => f.id === currentFarmId) ||
      farmSummary.find((f: any) => f.farmId === currentFarmId)
    : null;

  const myFarmRole = currentFarm
    ? currentFarm.myRole?.toLowerCase() === "worker"
      ? "employee"
      : currentFarm.myRole?.toLowerCase()
    : null;

  const effectiveRole = currentFarmId && myFarmRole ? myFarmRole : user?.role;

  const filterItem = (item: { key: string; roles?: string[] }) => {
    if (!currentFarmId) {
      return ["dashboard", "tree", "wallet", "gemini"].includes(item.key);
    }
    if (!item.roles) return true;
    if (!effectiveRole) return false;
    return item.roles.includes(effectiveRole);
  };

  /* ── COMPACT variant ── */
  if (variant === "compact") {
    return (
      <aside className="flex flex-col items-center h-full w-16 bg-white shrink-0 rounded-3xl shadow-sm border border-slate-100 py-6 px-2">
        <div className="flex flex-col items-center gap-2 w-full">
          {NAV_GROUPS.flatMap((g) => g.items)
            .concat(FOOTER_ITEMS)
            .filter(filterItem)
            .map((item) => (
              <Button
                key={item.key}
                onClick={() => setActive(item.key)}
                variant="ghost"
                size="icon"
                className={cn(
                  "w-10 h-10 rounded-xl transition-all duration-200",
                  active === item.key
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                )}
              >
                <item.icon
                  size={20}
                  className={active === item.key ? "text-emerald-600" : ""}
                />
              </Button>
            ))}
        </div>
      </aside>
    );
  }

  /* ── WIDE variant ── */
  return (
    <aside className="flex flex-col h-full w-[260px] bg-white shrink-0 rounded-[32px] border border-slate-100 shadow-sm">

      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-5 pb-3 shrink-0">
        <div className="w-8 h-8 bg-emerald-50 rounded-xl flex items-center justify-center border border-emerald-100 shrink-0">
          <Trees size={16} className="text-emerald-600" />
        </div>
        <p className="text-sm font-semibold text-slate-900 truncate">
          {currentFarm ? currentFarm.farmName || currentFarm.name : "Trang Trại"}
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col gap-3 px-3 overflow-hidden">
        {NAV_GROUPS.map((group) => {
          const visibleItems = group.items.filter(filterItem);
          if (!visibleItems.length) return null;
          return (
            <div key={group.title}>
              <p className="px-3 mb-1 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                {group.title}
              </p>
              <div className="flex flex-col gap-0.5">
                {visibleItems.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setActive(item.key)}
                    className={cn(
                      "flex items-center gap-2.5 w-full px-3 py-2 rounded-full text-sm font-medium transition-all duration-150",
                      active === item.key
                        ? "bg-emerald-50 text-emerald-700"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                    )}
                  >
                    <item.icon
                      size={16}
                      className={cn(
                        "shrink-0 transition-colors",
                        active === item.key ? "text-emerald-600" : "text-slate-400"
                      )}
                    />
                    <span className="truncate">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      {FOOTER_ITEMS.filter(filterItem).length > 0 && (
        <div className="shrink-0 px-3 pt-2 pb-4 border-t border-slate-100 mt-2 flex flex-col gap-0.5">
          <p className="px-3 mb-1 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
            Hệ thống
          </p>
          {FOOTER_ITEMS.filter(filterItem).map((item) => (
            <button
              key={item.key}
              onClick={() => setActive(item.key)}
              className={cn(
                "flex items-center gap-2.5 w-full px-3 py-2 rounded-full text-sm font-medium transition-all duration-150",
                active === item.key
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
              )}
            >
              <item.icon
                size={16}
                className={cn("shrink-0", active === item.key ? "text-emerald-600" : "text-slate-400")}
              />
              <span className="truncate">{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </aside>
  );
}