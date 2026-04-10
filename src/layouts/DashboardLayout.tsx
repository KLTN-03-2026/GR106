import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import Sidebar from "../components/layout/Sidebar";

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const getActive = () => location.pathname.split("/").pop() || "dashboard";
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
    } else if (key === "wallet") {
      navigate("/wallet");
    } else if (key === "activity") {
      navigate("/activity");
    } else if (key === "task") {
      navigate("/tasks");
    } else if (key === "gemini") {
      navigate("/gemini");
    } else if (key === "subscription") {
      navigate("/subscription");
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div className="w-full h-screen bg-[#F8FAFC] flex overflow-hidden p-3 gap-3">
      <Sidebar
        variant="dashboard"
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