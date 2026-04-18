import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import Sidebar from "../components/layout/Sidebar";
import { useDispatch, useSelector } from "react-redux";
import { clearFarmContext } from "../store/authSlice";
import { RootState } from "../store";
import { getRolesFromToken } from "../utils/jwt";
import { Navigate } from "react-router-dom";

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const currentFarmId = useSelector((state: RootState) => state.auth.currentFarmId);
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const isAdmin = accessToken ? getRolesFromToken(accessToken).includes('ROLE_ADMIN') : false;

  // Redirect admin away from /dashboard immediately
  if (isAdmin && location.pathname === "/dashboard") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const getActive = () => {
    const p = location.pathname;
    if (p.includes("/dashboard")) return "dashboard";
    if (p === "/farms") return "tree";
    if (p.includes("/members")) return "members";
    if (p.includes("/land-plots")) return "land-plots";
    if (p.includes("/map")) return "map";
    if (p.includes("/subscription")) return "subscription";
    if (p.includes("/activity")) return "activity";
    if (p.includes("/wallet")) return "wallet";
    if (p.includes("/tasks")) return "task";
    if (p.includes("/gemini")) return "gemini";
    if (p.includes("/crop-catalog")) return "crop-catalog";
    if (p.includes("/season-plans")) return "season-plans";
    if (p.includes("/change-password")) return "settings";

    // Default to 'tree' for any farm-specific action not matching above
    if (p.startsWith("/farms/")) return "tree";

    return p.split("/").pop() || "dashboard";
  };

  const [active, setActive] = useState(getActive());

  const wideSidebarPaths = ["/members", "/land-plots", "/map", "/subscription", "/crop-catalog", "/season-plans"];
  const isWideSidebarPage =
    wideSidebarPaths.some(path => location.pathname.includes(path)) ||
    (location.pathname.startsWith("/farms") && location.pathname !== "/farms");

  useEffect(() => {
    setActive(getActive());
  }, [location.pathname]);

  // If admin on /dashboard, show nothing while redirecting to prevent flash
  if (isAdmin && location.pathname === "/dashboard") {
    return null;
  }

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
      navigate(currentFarmId ? `/farms/${currentFarmId}/activity` : "/farms");
    } else if (key === "map") {
      navigate(currentFarmId ? `/farms/${currentFarmId}/map` : "/farms");
    } else if (key === "land-plots") {
      navigate(currentFarmId ? `/farms/${currentFarmId}/land-plots` : "/farms");
    } else if (key === "members") {
      navigate(currentFarmId ? `/farms/${currentFarmId}/members` : "/farms");
    } else if (key === "wallet") {
      navigate(currentFarmId ? `/farms/${currentFarmId}/wallet` : "/farms");
    } else if (key === "task") {
      navigate(currentFarmId ? `/farms/${currentFarmId}/tasks` : "/farms");
    } else if (key === "gemini") {
      navigate(currentFarmId ? `/farms/${currentFarmId}/gemini` : "/farms");
    } else if (key === "subscription") {
      navigate(currentFarmId ? `/farms/${currentFarmId}/subscription` : "/farms");
    } else if (key === "crop-catalog") {
      if (isAdmin) {
        navigate("/admin/crop-catalog");
      } else {
        navigate(currentFarmId ? `/farms/${currentFarmId}/crop-catalog` : "/farms");
      }
    } else if (key === "change-password") {
      navigate("/change-password");
    } else if (key === "season-plans") {
      navigate(currentFarmId ? `/farms/${currentFarmId}/season-plans` : "/farms");
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