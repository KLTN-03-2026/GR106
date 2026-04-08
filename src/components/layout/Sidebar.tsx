import { LayoutGrid, LogOut } from "lucide-react";
import { Button } from "../ui/button";
import { NAV_ICONS } from "../../layouts/NavIcon";
import { cn } from "../../utils/cn";

interface SidebarProps {
  active: string;
  setActive: (key: string) => void;
  variant?: "dashboard" | "compact" | "wide";
}

const sidebarVariants = {
  dashboard: "py-10 px-3 w-[72px] bg-white",
  compact: "py-5 px-2 w-16 bg-gray-50",
  wide: "py-10 px-4 w-20 bg-white",
};

export default function Sidebar({
  active,
  setActive,
  variant = "dashboard",
}: SidebarProps) {
  return (
    <aside
      className={cn(
        "flex flex-col items-center justify-between h-full shrink-0 border-r border-gray-100",
        sidebarVariants[variant],
      )}
    >
      {/* Top nav */}
      <div className="flex flex-col items-center gap-7">
        {/* Dashboard (active) */}
        <Button
          onClick={() => setActive("dashboard")}
          variant={active === "dashboard" ? "dark-olive" : "light"}
          size="icon"
          className="w-11 h-11 rounded-[14px] p-0"
        >
          <LayoutGrid
            size={20}
            color={active === "dashboard" ? "#fff" : "#292D32"}
          />
        </Button>

        {NAV_ICONS.map(({ icon: Icon, key }) => (
          <Button
            key={key}
            onClick={() => setActive(key)}
            variant={active === key ? "dark-olive" : "light"}
            size="icon"
            className="w-11 h-10 rounded-full p-0"
          >
            <Icon size={22} color={active === key ? "#fff" : "#292D32"} />
          </Button>
        ))}
      </div>

      {/* Logout */}
      <Button variant="ghost" size="icon" className="rounded-xl p-2 hover:bg-red-50 hover:text-red-500 transition-colors">
        <LogOut size={22} />
      </Button>
    </aside>
  );
}
