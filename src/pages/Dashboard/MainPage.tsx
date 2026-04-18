import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { fetchPlots } from '../../store/plotSlice';
import { fetchCrops } from '../../store/cropSlice';
import {
  StatCard,
  WeatherCard,
  NpkPanel,
  DonutChart,
  CropStatusCards,
  MapPanel,
  TaskBar,
} from "../../components/dashboard";

/**
 * Hook lấy số liệu tổng hợp từ Redux Store thay vì Mock Timer
 */
function useDashboardData(farmId?: string) {
  const dispatch = useDispatch<AppDispatch>();
  
  // Lấy dữ liệu từ store
  const { plots, loading: plotsLoading } = useSelector((state: RootState) => state.plot);
  const { crops, loading: cropsLoading } = useSelector((state: RootState) => state.crop);

  useEffect(() => {
    if (farmId) {
      dispatch(fetchPlots());
      dispatch(fetchCrops());
    }
  }, [farmId, dispatch]);

  const isLoading = plotsLoading || cropsLoading;

  return {
    stats: {
      totalPlots: plots.length,
      totalCrops: crops.length,
      totalArea: plots.reduce((acc, p) => acc + (p.areaHa || 0), 0),
      totalPlants: 0, // Chờ API cụ thể
      performancePct: 0, // Chờ chỉ số thực từ API
    },
    npkData: [], // Chờ API NPK
    isLoading
  };
}

export default function MainPage() {
  const { farmId: routeFarmId } = useParams<{ farmId: string }>();
  // Chỉ sử dụng farmId nếu nó tồn tại trên URL (Route Param)
  const farmId = routeFarmId || undefined;

  const { stats, npkData, isLoading } = useDashboardData(farmId);

  return (
    <div className="flex h-full w-full overflow-hidden p-3 gap-3">
      {/* Main Content */}
      <div className="flex flex-col flex-1 gap-3 overflow-hidden">

        <TaskBar
          completed={0}
          pending={0}
          isLoading={isLoading}
        />

        {/* Row 1 */}
        <div className="flex flex-1 gap-3 min-h-0 overflow-hidden flex-col xl:flex-row">
          <div className="grid grid-cols-2 gap-3 flex-1 min-h-0 overflow-hidden">
            <StatCard label="Tổng lô đất" value={isLoading ? "..." : stats.totalPlots} unit="Lô" />
            <StatCard label="Loại cây trồng" value={isLoading ? "..." : stats.totalCrops} unit="Loại" />
            <StatCard label="Tổng diện tích" value={isLoading ? "..." : stats.totalArea.toFixed(1)} unit="ha" />
            <StatCard label="Tổng số cây" value={isLoading ? "..." : stats.totalPlants} unit="Cây" />
          </div>

          <div className="flex-1 min-h-0 overflow-hidden">
            <WeatherCard />
          </div>
        </div>

        {/* Row 2 */}
        <div className="flex flex-1 gap-4 min-h-0 overflow-hidden flex-col lg:flex-row">
          <div className="flex-1 min-h-0 overflow-hidden">
            <NpkPanel data={npkData} isLoading={isLoading} />
          </div>
          <div className="flex-1 min-h-0 overflow-hidden">
            <DonutChart pct={stats.performancePct} isLoading={isLoading} />
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