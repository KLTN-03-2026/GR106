import { LayoutGrid, LogOut } from "lucide-react";
import { Button } from "../ui/button";
import { NAV_ICONS } from "../../layouts/NavIcon";
import { cn } from "../../utils/cn";
import { useAuth } from "../../hooks/useAuth";

interface SidebarProps {
  active: string;
  setActive: (key: string) => void;
  variant?: "dashboard" | "compact" | "wide";
}

const sidebarVariants = {
  dashboard: "py-6 px-2 w-[64px] bg-white",
  compact: "py-4 px-2 w-14 bg-gray-50",
  wide: "py-8 px-3 w-[72px] bg-white",
};

export default function Sidebar({
  active,
  setActive,
  variant = "dashboard",
}: SidebarProps) {
  const { logout } = useAuth();

  return (
    <aside
      className={cn(
        "flex flex-col items-center justify-between h-full shrink-0 border-r border-gray-100",
        sidebarVariants[variant],
      )}
    >
      {/* Top nav */}
      <div className="flex flex-col items-center gap-6">
        {/* Dashboard */}
        <Button
          onClick={() => setActive("dashboard")}
          variant={active === "dashboard" ? "dark-nav" : "ghost"}
          size="icon"
          className={cn(
            "w-9 h-9 rounded-xl p-0 transition-all duration-200",
            active === "dashboard" ? "shadow-md" : "hover:bg-gray-100"
          )}
        >
          <LayoutGrid
            size={22}
            color={active === "dashboard" ? "#fff" : "#111827"}
            strokeWidth={2}
          />
        </Button>

        {NAV_ICONS.map(({ icon: Icon, key }) => (
          <Button
            key={key}
            onClick={() => setActive(key)}
            variant={active === key ? "dark-nav" : "ghost"}
            size="icon"
            className={cn(
              "w-9 h-9 rounded-xl p-0 transition-all duration-200",
              active === key ? "shadow-md" : "hover:bg-gray-100 hover:text-gray-900"
            )}
          >
            <Icon
              size={22}
              color={active === key ? "#fff" : "#374151"}
              strokeWidth={2}
            />
          </Button>
        ))}
      </div>

      {/* Logout */}
      <Button
        variant="ghost"
        size="icon"
        onClick={logout}
        className="w-9 h-9 rounded-xl p-0 hover:bg-red-50 hover:text-red-500 transition-colors"
      >
        <LogOut size={22} color="#374151" strokeWidth={2} />
      </Button>
    </aside>
  );
}