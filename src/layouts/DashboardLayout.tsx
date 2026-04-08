import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import LogoBrowser from "../assets/Logo-browser.png";
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
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div className="w-full h-screen bg-white flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex items-center px-6 py-3 h-[57px] bg-white shrink-0 border-b border-gray-100">
        <div
          className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => navigate("/")}
        >
          <div className="w-10 h-10 rounded-full bg-[#e8f5e2] flex items-center justify-center">
            <img
              src={LogoBrowser}
              alt="Logo"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <span
            className="text-[28px] font-extrabold leading-none"
            style={{ color: "#1F4418", fontFamily: "'Prompt', sans-serif" }}
          >
            FarmerAI
          </span>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden gap-3 p-3 bg-gray-50/30">
        <Sidebar
          variant="dashboard"
          active={active}
          setActive={handleNav}
        />

        {/* Main Content Area - Đã fix full height */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white rounded-2xl shadow-sm border border-gray-100">
          <Outlet />
        </div>
      </div>
    </div>
  );
}