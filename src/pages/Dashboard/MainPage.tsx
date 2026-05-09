import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/auth/useAuth';
import { usePlots } from '../../hooks/plots/usePlots';
import { useCrops } from '../../hooks/crops/useCrops';
import { useSeasonPlans } from '../../hooks/seasonPlans/useSeasonPlans';
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
 * Hook lấy số liệu tổng hợp từ Redux Store
 */
function useDashboardData(farmId?: string) {
  const [isSyncing, setIsSyncing] = useState(false);
  
  const { plots, plotsLoading, clearPlots } = usePlots(farmId);
  const { crops, cropTypes, loading: cropsLoading, cropTypesLoading, fetchFarmCrops, fetchCrops, fetchCropTypes } = useCrops();
  const { plans, loading: plansLoading, fetchPlans } = useSeasonPlans(farmId);

  useEffect(() => {
    const loadData = async () => {
      try {
        // 1. Luôn load danh mục loại cây (Global Catalog)
        await Promise.allSettled([fetchCropTypes()]);
        
        if (farmId) {
          // 2a. CHẾ ĐỘ TRANG TRẠI: Load dữ liệu của farm này
          await Promise.allSettled([
            fetchFarmCrops(farmId),
            fetchPlans(farmId)
          ]);
        } else {
          // 2b. CHẾ ĐỘ HUB: Load dữ liệu hệ thống (Public crops)
          clearPlots();
          await Promise.allSettled([
            fetchCrops()
          ]);
        }
      } catch (error) {
        console.error("Dashboard data sync error:", error);
      } finally {
        setIsSyncing(false);
      }
    };

    loadData();
  }, [farmId, fetchCropTypes, fetchFarmCrops, fetchCrops, fetchPlans, clearPlots]);

  const isLoading = (farmId && (plotsLoading || cropsLoading || plansLoading)) || cropTypesLoading || isSyncing;

  // Tính toán tiến trình trung bình dựa trên status của plans
  const calculatePerformance = () => {
    if (!farmId || plans.length === 0) return 0;
    const totalProgress = plans.reduce((acc, plan) => {
      const status = typeof plan.status === 'string' ? plan.status : plan.status.code;
      if (status === 'COMPLETED') return acc + 100;
      if (status === 'ACTIVE' || status === 'HARVESTING') return acc + 50;
      if (status === 'DRAFT' || status === 'READY_TO_HARVEST') return acc + 10;
      return acc;
    }, 0);
    return Math.round(totalProgress / plans.length);
  };

  return {
    stats: {
      totalPlots: farmId ? plots.length : 0,
      totalCrops: farmId 
        ? Array.from(new Set(crops.map(c => c.cropType.id))).length 
        : cropTypes.length, 
      totalArea: farmId 
        ? plots.reduce((acc, p) => acc + (Number(p.areaHa) || 0), 0)
        : 0,
      totalPlants: crops.length, // Trong Farm là số cây farm, trong Hub là số cây system
      performancePct: calculatePerformance(), 
    },
    npkData: [], 
    isLoading
  };
}

export default function MainPage() {
  const { farmId: routeFarmId } = useParams<{ farmId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Force Admin to system dashboard if they land here
  useEffect(() => {
    const role = (user?.role || '').toUpperCase();
    if (role === 'ADMIN' || role === 'ROLE_ADMIN') {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [user, navigate]);

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
          <div className="grid grid-cols-2 md:grid-cols-2 gap-3 flex-1 min-h-0 overflow-hidden">
            <StatCard label="Lô đất" value={isLoading ? "..." : stats.totalPlots} unit="Lô" />
            <StatCard label="Loại cây trồng" value={isLoading ? "..." : stats.totalCrops} unit="Loại" />
            <StatCard label="Diện tích" value={isLoading ? "..." : stats.totalArea.toFixed(1)} unit="ha" />
            <StatCard label="Số lượng cây" value={isLoading ? "..." : stats.totalPlants} unit="Cây" />
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