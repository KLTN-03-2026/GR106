import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import Sidebar from "../components/layout/Sidebar";

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const getActive = () => {
    const p = location.pathname;
    if (p === "/dashboard") return "dashboard";
    if (p.startsWith("/farms")) return "tree";
    if (p.startsWith("/members")) return "members";
    if (p.startsWith("/land-plots")) return "land-plots";
    if (p.startsWith("/map")) return "map";
    if (p.startsWith("/wallet")) return "wallet";
    if (p.startsWith("/tasks")) return "task";
    if (p.startsWith("/activity")) return "activity";
    if (p.startsWith("/gemini")) return "gemini";
    if (p.startsWith("/subscription")) return "subscription";
    if (p.startsWith("/change-password")) return "settings";
    return p.split("/").pop() || "dashboard";
  };

  const [active, setActive] = useState(getActive());

  useEffect(() => {
    setActive(getActive());
  }, [location.pathname]);

  const handleNav = (key: string) => {
    setActive(key);
    if (key === "dashboard") {
      navigate("/dashboard");
    } else if (key === "tree") {
      navigate("/farms");
    } else if (key === "activity") {
      navigate("/activity");
    } else if (key === "map") {
      navigate("/map");
    } else if (key === "land-plots") {
      navigate("/land-plots");
    } else if (key === "members") {
      navigate("/members");
    } else if (key === "wallet") {
      navigate("/wallet");
    } else if (key === "task") {
      navigate("/tasks");
    } else if (key === "gemini") {
      navigate("/gemini");
    } else if (key === "subscription") {
      navigate("/subscription");
    } else if (key === "change-password") {
      navigate("/change-password");
    } else if (key === "settings") {
      // Handled by Sidebar internally for sub-menu or default to dashboard
    } else {
      navigate("/dashboard");
    }
  };

  const wideSidebarPaths = ["/members", "/land-plots", "/map", "/subscription"];
  const isWideSidebarPage = 
    wideSidebarPaths.some(path => location.pathname.includes(path)) || 
    (location.pathname.startsWith("/farms") && location.pathname !== "/farms");

  return (
    <div className="w-full h-screen bg-[#F8FAFC] flex overflow-hidden p-3 gap-3">
      <Sidebar
        variant={isWideSidebarPage ? "wide" : "compact"}
        active={active}
        setActive={handleNav}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white rounded-[32px] shadow-sm border border-slate-200">
        <Outlet />
      </div>
    </div>
  );
}