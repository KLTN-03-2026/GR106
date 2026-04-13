import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import Sidebar from "../components/layout/Sidebar";
import { useDispatch, useSelector } from "react-redux";
import { clearFarmContext } from "../store/authSlice";
import { RootState } from "../store";

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const currentFarmId = useSelector((state: RootState) => state.auth.currentFarmId);

  const getActive = () => {
    const p = location.pathname;
    if (p === "/dashboard") return "dashboard";
    if (p === "/farms") return "tree";
    if (p.includes("/members")) return "members";
    if (p.includes("/land-plots")) return "land-plots";
    if (p.includes("/map")) return "map";
    if (p.includes("/subscription")) return "subscription";
    if (p.includes("/activity")) return "activity";
    if (p.includes("/wallet")) return "wallet";
    if (p.includes("/tasks")) return "task";
    if (p.includes("/gemini")) return "gemini";
    if (p.includes("/change-password")) return "settings";
    
    // Default to 'tree' for any farm-specific action not matching above
    if (p.startsWith("/farms/")) return "tree";
    
    return p.split("/").pop() || "dashboard";
  };

  const [active, setActive] = useState(getActive());

  const wideSidebarPaths = ["/members", "/land-plots", "/map", "/subscription"];
  const isWideSidebarPage = 
    wideSidebarPaths.some(path => location.pathname.includes(path)) || 
    (location.pathname.startsWith("/farms") && location.pathname !== "/farms");

  useEffect(() => {
    setActive(getActive());
  }, [location.pathname]);

  const handleNav = (key: string) => {
    setActive(key);
    if (key === "dashboard") {
      navigate("/dashboard");
    } else if (key === "tree") {
      if (isWideSidebarPage && currentFarmId) {
        navigate(`/farms/${currentFarmId}/actions`);
      } else {
        dispatch(clearFarmContext());
        navigate("/farms");
      }
    } else if (key === "activity") {
      navigate(currentFarmId ? `/farms/${currentFarmId}/activity` : "/activity");
    } else if (key === "map") {
      navigate(currentFarmId ? `/farms/${currentFarmId}/map` : "/map");
    } else if (key === "land-plots") {
      navigate(currentFarmId ? `/farms/${currentFarmId}/land-plots` : "/land-plots");
    } else if (key === "members") {
      navigate(currentFarmId ? `/farms/${currentFarmId}/members` : "/members");
    } else if (key === "wallet") {
      navigate(currentFarmId ? `/farms/${currentFarmId}/wallet` : "/wallet");
    } else if (key === "task") {
      navigate(currentFarmId ? `/farms/${currentFarmId}/tasks` : "/tasks");
    } else if (key === "gemini") {
      navigate(currentFarmId ? `/farms/${currentFarmId}/gemini` : "/gemini");
    } else if (key === "subscription") {
      navigate(currentFarmId ? `/farms/${currentFarmId}/subscription` : "/subscription");
    } else if (key === "change-password") {
      navigate("/change-password");
    } else if (key === "settings") {
      // Handled by Sidebar internally for sub-menu or default to dashboard
    } else {
      navigate("/dashboard");
    }
  };


  return (
    <div className="w-full h-screen bg-[#F8FAFC] flex overflow-hidden p-3 gap-3">
      <Sidebar
        variant={isWideSidebarPage ? "wide" : "compact"}
        active={active}
        setActive={handleNav}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-y-auto bg-white rounded-[32px] shadow-sm border border-slate-200">
        <Outlet />
      </div>
    </div>
  );
}