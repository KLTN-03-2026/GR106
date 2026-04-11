import { useState, useEffect } from 'react';
import {
  StatCard,
  WeatherCard,
  NpkPanel,
  DonutChart,
  CropStatusCards,
  MapPanel,
  TaskBar,
} from "../../components/dashboard";

// Mock Hooks moved directly into this file to avoid external dependencies
function useFarmStats() {
  const [data] = useState({
    totalPlots: 0,
    totalCrops: 0,
    totalArea: 0,
    totalPlants: 0,
    performancePct: 0,
  });
  const [isPending, setIsPending] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPending(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  return { data, isPending };
}

function useNpkData() {
  const [data] = useState([]);
  const [isPending, setIsPending] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPending(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return { data, isPending };
}

function useTasksSummary() {
  const [data] = useState({
    completed: 0,
    pending: 0,
  });
  const [isPending, setIsPending] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPending(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  return { data, isPending };
}

export default function MainPage() {
  const { data: statsData, isPending: statsLoading } = useFarmStats();
  const { data: npkData, isPending: npkLoading } = useNpkData();
  const { data: taskData, isPending: taskLoading } = useTasksSummary();

  return (
    <div className="flex h-full w-full overflow-hidden p-3 gap-3">
      {/* Main Content */}
      <div className="flex flex-col flex-1 gap-3 overflow-hidden">

        <TaskBar
          completed={taskData?.completed || 0}
          pending={taskData?.pending || 0}
          isLoading={taskLoading}
        />

        {/* Row 1 */}
        <div className="flex flex-1 gap-3 min-h-0 overflow-hidden flex-col xl:flex-row">
          <div className="grid grid-cols-2 gap-3 flex-1 min-h-0 overflow-hidden">
            <StatCard label="Tổng lô đất" value={statsLoading ? "..." : statsData?.totalPlots || 0} unit="Plots" />
            <StatCard label="Loại cây trồng" value={statsLoading ? "..." : statsData?.totalCrops || 0} unit="Crops" />
            <StatCard label="Tổng diện tích" value={statsLoading ? "..." : statsData?.totalArea || 0} unit="Hectares" />
            <StatCard label="Tổng số cây" value={statsLoading ? "..." : statsData?.totalPlants || "0"} unit="Plants" />
          </div>

          <div className="flex-1 min-h-0 overflow-hidden">
            <WeatherCard />
          </div>
        </div>

        {/* Row 2 */}
        <div className="flex flex-1 gap-4 min-h-0 overflow-hidden flex-col lg:flex-row">
          <div className="flex-1 min-h-0 overflow-hidden">
            <NpkPanel data={npkData} isLoading={npkLoading} />
          </div>
          <div className="flex-1 min-h-0 overflow-hidden">
            <DonutChart pct={statsData?.performancePct || 0} isLoading={statsLoading} />
          </div>
        </div>

        {/* Row 3 */}
        <div className="flex-none h-[85px] overflow-hidden">
          <CropStatusCards />
        </div>
      </div>

      {/* Map Panel */}
      <div className="hidden lg:block w-[380px] xl:w-[440px] shrink-0 h-full overflow-hidden rounded-2xl bg-gray-50 border border-gray-100 shadow-sm">
        <MapPanel />
      </div>
    </div>
  );
}