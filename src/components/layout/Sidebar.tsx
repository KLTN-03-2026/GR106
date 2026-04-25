import { useState } from "react";
import {
  LayoutGrid,
  LayoutDashboard,
  Activity,
  Map as MapIcon,
  Grid3X3,
  Users,
  CreditCard,
  Settings,
  Trees,
  Zap,
  Wallet,
  GitFork,
  Sparkles,
  LogOut,
  Key,
  Warehouse,
  Truck,
  Tag,
} from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "../../utils/cn";
import { useAuth } from "../../hooks/auth/useAuth";
import { NAV_ICONS } from "../../layouts/NavIcon";
import { useCurrentSubscription } from "../../hooks/subscription/useSubscription";
import { getRoleDisplayName } from "../../utils/roleUtils";
import { useFarms } from "../../hooks/farms/useFarms";
import { ConfirmModal } from "../ui/ConfirmModal";

interface SidebarProps {
  active: string;
  setActive: (key: string) => void;
  variant?: "compact" | "wide";
}

const NAV_GROUPS = [
  {
    title: "TỔNG QUAN",
    items: [
      { key: "tree", label: "Trang trại của tôi", icon: Trees }, // Luôn hiển thị (multi-tenant)
      { key: "dashboard", label: "Bảng điều khiển", icon: LayoutDashboard, roles: ["owner", "admin"] },
      { key: "activity", label: "Theo dõi chỉ số", icon: Activity, roles: ["owner", "admin"] },
    ]
  },
  {
    title: "TIỆN ÍCH",
    items: [
      { key: "wallet", label: "Ví & Thanh toán", icon: Wallet, roles: ["owner", "admin"] },
      { key: "activity", label: "Hoạt động", icon: Activity, roles: ["owner", "admin"] },
      { key: "task", label: "Nhiệm vụ", icon: GitFork, roles: ["owner", "admin", "employee"] }, // Nhân công xem nhiệm vụ được giao
      { key: "gemini", label: "Trợ lý AI", icon: Sparkles, roles: ["owner", "admin"] },
    ]
  },
  {
    title: "QUẢN LÝ",
    items: [
      { key: "map", label: "Bản đồ nông trại", icon: MapIcon, roles: ["owner", "admin"] },
      { key: "land-plots", label: "Lô đất & Cây trồng", icon: Grid3X3, roles: ["owner", "admin"] },
      { key: "crop-catalog", label: "Danh mục cây trồng", icon: Trees, roles: ["owner", "admin"] },
      { key: "season-plans", label: "Kế hoạch mùa vụ", icon: Zap, roles: ["owner", "manager", "admin"] }, // Manager chỉ xem
      { key: "warehouses", label: "Kho hàng", icon: Warehouse, roles: ["owner", "manager", "admin"] }, // Manager chỉ xem, Owner toàn quyền
      { key: "suppliers", label: "Nhà cung cấp", icon: Truck, roles: ["owner", "manager", "admin"] },
      { key: "skus", label: "Mã SKU", icon: Tag, roles: ["owner", "manager", "admin"] },
      { key: "members", label: "Thành viên", icon: Users, roles: ["owner", "admin"] }, // Manager không quản lý thành viên
    ]
  },
  {
    title: "HỆ THỐNG",
    items: [
      { key: "subscription", label: "Dịch vụ & Gói cước", icon: CreditCard, roles: ["owner"] },
    ]
  }
];

export default function Sidebar({
  active,
  setActive,
  variant = "compact",
}: SidebarProps) {
  const { user, currentFarmId, logout } = useAuth();
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const { farmSummary } = useFarms();
  const { data: currentSubscription, isLoading: loadingSub } = useCurrentSubscription();

  const handleLogout = () => {
    setIsSettingsModalOpen(false);
    setIsLogoutConfirmOpen(true);
  };

  const onConfirmLogout = () => {
    logout();
    setIsLogoutConfirmOpen(false);
  };

  const handleChangePassword = () => {
    setActive("change-password");
    setIsSettingsModalOpen(false);
  };

  const currentFarm = currentFarmId ? farmSummary.find((f: any) => f.farmId === currentFarmId) : null;

  // Lấy role thực tế từ farmSummary API (chính xác nhất, không phụ thuộc parse token)
  // Ví dụ: 'OWNER', 'MANAGER', 'WORKER' -> chuẩn hóa thành lowercase
  const myFarmRole = currentFarm
    ? (currentFarm.myRole?.toLowerCase() === 'worker' ? 'employee' : currentFarm.myRole?.toLowerCase())
    : null;

  // Role hiệu lực: uu tiên myFarmRole (khi trong farm), fallback user.role (hub level)
  const effectiveRole = (currentFarmId && myFarmRole) ? myFarmRole : user?.role;

  return (
    <>
      {variant === "compact" ? (
        <aside className="flex flex-col items-center justify-between h-full w-[64px] bg-white shrink-0 rounded-[24px] shadow-sm border border-slate-100 py-6 px-2 transition-all duration-300">
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
              .filter(item => {
                if (item.key === "season-plans" && !currentFarmId) return false;
                if (!currentFarmId) return true;

                const groupItem = NAV_GROUPS.flatMap(g => g.items).find(i => i.key === item.key);
                if (groupItem?.roles) {
                  return effectiveRole ? groupItem.roles.includes(effectiveRole) : false;
                }
                return true;
              })
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

          {!currentFarmId && (
            <div className="relative">
              <Button
                onClick={() => setIsSettingsModalOpen((prev) => !prev)}
                variant="ghost"
                size="icon"
                className={cn(
                  "w-10 h-10 rounded-xl transition-all duration-200",
                  isSettingsModalOpen ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:bg-gray-100"
                )}
              >
                <Settings size={22} />
              </Button>
              {isSettingsModalOpen && (
                <div className="absolute bottom-0 left-full ml-2 w-52 rounded-2xl border border-slate-200 bg-white shadow-xl p-2 z-50">
                  <button
                    onClick={handleChangePassword}
                    className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <Key size={16} />
                    <span>Đổi mật khẩu</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                  >
                    <LogOut size={16} />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {currentFarmId && (
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-[11px] border-2 border-white shadow-sm shrink-0">
                {((!user?.fullName || user.fullName === "Thành viên") ? getRoleDisplayName(user?.role) : user.fullName).split(" ").pop()?.charAt(0) || "U"}
              </div>
            </div>
          )}
        </aside>
      ) : (
        // ==================== PHẦN WIDE (giữ nguyên) ====================
        <aside className="flex flex-col h-full w-[250px] bg-white shrink-0 rounded-[32px] shadow-sm border border-slate-200 p-2 transition-all duration-300">
          {/* Brand Label */}
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

          {/* Navigation Groups */}
          <nav className="flex-1 flex flex-col gap-2 shrink-0 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
            {NAV_GROUPS.map((group) => (
              <div key={group.title} className="flex flex-col gap-0">
                <h3 className="px-4 text-[7px] font-black text-slate-400 uppercase tracking-[2px] mb-0.5 opacity-70">
                  {group.title}
                </h3>
                <div className="flex flex-col gap-0.5">
                  {group.items
                    .filter(item => {
                      if (item.key === "season-plans" && !currentFarmId) return false;
                      if (!currentFarmId) return true;
                      if (item.roles) {
                        return effectiveRole ? item.roles.includes(effectiveRole) : false;
                      }
                      return true;
                    })
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

          {/* User Profile */}
          <div className="mt-auto pt-1.5 border-t border-slate-100 flex flex-col shrink-0">
            <div className="flex items-center gap-2 px-3 pb-1">
              <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-[9px] border-2 border-white shadow-sm shrink-0">
                {((!user?.fullName || user.fullName === "Thành viên") ? getRoleDisplayName(user?.role) : user.fullName).split(" ").pop()?.charAt(0) || "U"}
              </div>
              <div className="flex-1 overflow-hidden ml-1">
                <h4 className="text-[11px] font-black text-slate-800 truncate leading-tight">
                  {(!user?.fullName || user.fullName === "Thành viên")
                    ? getRoleDisplayName(user?.role || '')
                    : user.fullName}
                </h4>
              </div>
              {!currentFarmId && (
                <div className="relative">
                  <button
                    onClick={() => setIsSettingsModalOpen((prev) => !prev)}
                    className={cn(
                      "p-1.5 rounded-lg transition-colors",
                      isSettingsModalOpen ? "bg-slate-100 text-slate-900" : "text-slate-400 hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    <Settings size={18} />
                  </button>
                  {isSettingsModalOpen && (
                    <div className="absolute bottom-11 right-0 w-52 rounded-2xl border border-slate-200 bg-white shadow-xl p-2 z-50">
                      <button
                        onClick={handleChangePassword}
                        className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        <Key size={16} />
                        <span>Đổi mật khẩu</span>
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                      >
                        <LogOut size={16} />
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </aside>
      )}

      {/* Logout Confirmation Modal */}
      <ConfirmModal
        isOpen={isLogoutConfirmOpen}
        onClose={() => setIsLogoutConfirmOpen(false)}
        onConfirm={onConfirmLogout}
        title="Xác nhận đăng xuất"
        message="Bạn có chắc chắn muốn thoát khỏi phiên làm việc hiện tại?"
        confirmLabel="Đăng xuất ngay"
        cancelLabel="Quay lại"
        type="danger"
      />
    </>
  );
}