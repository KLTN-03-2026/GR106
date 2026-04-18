import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { fetchPlots, clearPlots, setAggregateStats, setPlots } from '../../store/plotSlice';
import { fetchCrops, fetchCropTypes } from '../../store/cropSlice';
import { dashboardService } from '../../services/dashboardService';
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
  const { hubToken } = useSelector((state: RootState) => state.auth);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Lấy dữ liệu từ store
  const { plots, aggregateStats, loading: plotsLoading } = useSelector((state: RootState) => state.plot);
  const { crops, cropTypes, loading: cropsLoading, cropTypesLoading } = useSelector((state: RootState) => state.crop);

  useEffect(() => {
    // 1. Luôn load danh mục cây trồng và loại cây (Global)
    dispatch(fetchCrops());
    dispatch(fetchCropTypes());

    if (farmId) {
      // 2a. CHẾ ĐỘ TRANG TRẠI: Load lô đất của farm này
      dispatch(fetchPlots());
      setIsSyncing(false);
    } else {
      // 2b. CHẾ ĐỘ HUB: Quét nền lấy dữ liệu tổng hợp
      dispatch(clearPlots());
      
      if (hubToken) {
        setIsSyncing(true);
        // Chạy ngầm việc quét nền
        dashboardService.fetchAggregateStats(hubToken)
          .then(data => {
            dispatch(setAggregateStats({ totalPlots: data.totalPlots, totalArea: data.totalArea }));
            dispatch(setPlots(data.allPlots));
          })
          .catch(err => {
            console.error('[Dashboard] Background aggregate failed', err);
          })
          .finally(() => {
            setIsSyncing(false);
          });
      }
    }
  }, [farmId, dispatch, hubToken]);

  const isLoading = (farmId && plotsLoading) || cropsLoading || cropTypesLoading || isSyncing;

  return {
    stats: {
      totalPlots: plots.length > 0 ? plots.length : aggregateStats.totalPlots,
      totalCrops: cropTypes.length, 
      totalArea: plots.length > 0 
        ? plots.reduce((acc, p) => acc + (Number(p.areaHa) || 0), 0)
        : aggregateStats.totalArea,
      totalPlants: crops.length,
      performancePct: 0, 
    },
    npkData: [], 
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