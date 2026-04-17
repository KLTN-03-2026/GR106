import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { SeasonPlan, PlanStatus } from '../../types/seasonPlan';
import { fetchPlans, createPlan } from '../../store/seasonPlanSlice';
import { fetchPlots } from '../../store/plotSlice';
import { fetchCrops } from '../../store/cropSlice';
import { canEditPlan } from '../../utils/seasonPlanUtils';
import { Search, Calendar, MapPin, Wheat, Loader2, Info } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Button } from '../../components/ui/button';
import { CreatePlanModal } from './components/CreatePlanModal';
import { useAuth } from '../../hooks/useAuth';

export function SeasonPlanListPage() {
  const { farmId } = useParams<{ farmId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  const { plans, loading, error } = useSelector((state: RootState) => state.seasonPlan);
  const { plots } = useSelector((state: RootState) => state.plot);
  const { crops } = useSelector((state: RootState) => state.crop);
  const { user, accessToken } = useAuth();
  
  // Kiểm tra quyền: Ưu tiên role trong user object, fallback kiểm tra trực tiếp trong token
  const canEdit = canEditPlan(user?.role, accessToken);

   useEffect(() => {
     // Ensure we have proper farm context
     if (user && accessToken && !farmId) {
       // Try to get farmId from user's farms if available
       // This is a fallback - ideally farmId should come from route params
     }
     
     // Fetch data only when we have necessary context
     dispatch(fetchPlans());
     dispatch(fetchPlots());
     dispatch(fetchCrops());
   }, [dispatch, user, accessToken, farmId]);

  const farmPlans = plans.filter((p: SeasonPlan) => p.farmId === farmId || p.farmId === '');

  const [statusFilter, setStatusFilter] = useState<PlanStatus | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const filteredPlans = farmPlans.filter((p: SeasonPlan) => {
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleCreatePlan = async (newPlanData: any) => {
    try {
      await dispatch(createPlan(newPlanData)).unwrap();
      setIsCreateModalOpen(false);
    } catch (err) {
      // Error is handled by Redux state, but we could also show a toast here
      console.error('Failed to create plan:', err);
    }
  };

  const getStatusLabel = (status: PlanStatus) => {
    switch (status) {
      case 'DRAFT': return 'Bản nháp';
      case 'ACTIVE': return 'Đang thực hiện';
      case 'READY_TO_HARVEST': return 'Sẵn sàng thu hoạch';
      case 'HARVESTING': return 'Đang thu hoạch';
      case 'COMPLETED': return 'Hoàn thành';
      case 'CANCELLED': return 'Đã hủy';
      default: return status;
    }
  };

  const getStatusColor = (status: PlanStatus) => {
    switch (status) {
      case 'DRAFT': return 'bg-slate-100 text-slate-600';
      case 'ACTIVE': return 'bg-indigo-100 text-indigo-700';
      case 'READY_TO_HARVEST': return 'bg-lime-100 text-lime-700';
      case 'HARVESTING': return 'bg-emerald-100 text-emerald-700';
      case 'COMPLETED': return 'bg-slate-100 text-slate-400';
      case 'CANCELLED': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric'
    });
  };

   const getPlotName = (id: string) => {
     if (!id) return 'Chưa chọn lô đất';
     const plot = plots.find(p => p.id === id);
     return plot ? plot.name : 'Lô đất không xác định';
   };
 
   const getCropName = (id: string) => {
     if (!id) return 'Chưa chọn cây trồng';
     const crop = crops.find(c => c.id === id);
     return crop ? crop.name : 'Cây trồng không xác định';
   };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-slate-50 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col gap-4 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Kế hoạch mùa vụ</h1>
            <p className="text-sm text-slate-500 mt-0.5">Danh sách các mùa vụ của trang trại</p>
          </div>
          <div className="flex items-center gap-3">
            {canEdit ? (
              <Button 
                className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-100 transition-all font-bold px-6"
                onClick={() => setIsCreateModalOpen(true)}
              >
                + Tạo vụ mùa
              </Button>
            ) : (
              <div className="px-4 py-2 bg-slate-100 rounded-xl flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                <Info size={14} />
                Chế độ chỉ xem
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative group flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Tìm kiếm mùa vụ..."
              className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl shrink-0 overflow-x-auto max-w-full no-scrollbar">
            {(['ALL', 'DRAFT', 'ACTIVE', 'READY_TO_HARVEST', 'HARVESTING', 'COMPLETED', 'CANCELLED'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={cn(
                  "px-4 py-1.5 text-xs font-bold rounded-lg transition-all uppercase tracking-wider",
                  statusFilter === status 
                    ? "bg-white text-indigo-600 shadow-sm" 
                    : "text-slate-500 hover:text-slate-900 font-medium"
                )}
              >
                {status === 'ALL' ? 'Tất cả' : getStatusLabel(status)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Season Cards Grid */}
      <div className="flex-1 overflow-auto p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <Loader2 size={48} className="mb-4 animate-spin text-indigo-500" />
            <p className="text-lg font-medium">Đang tải kế hoạch...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full text-red-500">
            <p className="text-lg font-medium">Lỗi khi tải dữ liệu</p>
            <p className="text-sm">{typeof error === 'string' ? error : JSON.stringify(error)}</p>
            <Button 
               variant="outline" 
               className="mt-4 border-red-200 text-red-600 hover:bg-red-50"
               onClick={() => dispatch(fetchPlans())}
            >
              Thử lại
            </Button>
          </div>
        ) : filteredPlans.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <Calendar size={48} className="mb-4 opacity-50" />
            <p className="text-lg font-medium">Chưa có mùa vụ nào</p>
            <p className="text-sm">Tạo mùa vụ đầu tiên để bắt đầu</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPlans.map((plan) => (
              <div
                key={plan.id}
                onClick={() => navigate(`/farms/${farmId}/season-plans/${plan.id}`)}
                className="bg-white rounded-xl border border-slate-200 p-5 cursor-pointer hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-100/50 transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {plan.name}
                  </h3>
                  <span className={cn(
                    "px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full",
                    getStatusColor(plan.status)
                  )}>
                    {getStatusLabel(plan.status)}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Calendar size={14} />
                    <span>
                      {formatDate(plan.startDate)} - {formatDate(plan.endDate)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Wheat size={14} />
                    <span className="font-medium text-slate-700">{getCropName(plan.cropId)}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <MapPin size={14} />
                    <span className="font-medium text-slate-700">{getPlotName(plan.plotId)}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {plan.phases.slice(0, 3).map((phase, idx) => (
                        <div
                          key={phase.id}
                          className={cn(
                            "w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-bold text-white",
                            phase.color || 'bg-purple-500'
                          )}
                          style={{ backgroundColor: phase.color?.replace('bg-', '') || '#8b5cf6' }}
                        >
                          {idx + 1}
                        </div>
                      ))}
                      {plan.phases.length > 3 && (
                        <div className="w-6 h-6 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[8px] font-bold text-slate-600">
                          +{plan.phases.length - 3}
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-slate-400">
                      {plan.phases.length} giai đoạn
                    </span>
                  </div>
                  <div className="text-xs font-medium text-indigo-600 group-hover:text-indigo-700 flex items-center gap-1">
                    Xem chi tiết
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CreatePlanModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreatePlan}
        existingPlans={plans}
      />
    </div>
  );
}

export default SeasonPlanListPage;
