import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { 
  addPlan,
  updatePlan, 
  addPhase,
  updatePhase,
  addTask,
  updateTask,
  fetchPlans,
  createPlan,
  deletePlan as removePlan
} from '../../store/seasonPlanSlice';
import { SeasonPlan, PlanStatus, Phase } from '../../types/seasonPlan';
import { Search, ArrowLeft, Loader2, Info } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Button } from '../../components/ui/button';
import { useAuth } from '../../hooks/useAuth';
import { canEditPlan } from '../../utils/seasonPlanUtils';
import { fetchPlots } from '../../store/plotSlice';
import { fetchCrops } from '../../store/cropSlice';

import { PlanTimeline } from './components/PlanTimeline';
import { CreatePlanModal } from './components/CreatePlanModal';
import { ClonePlanModal } from './components/ClonePlanModal';
import { PlanDetailPanel } from './components/PlanDetailPanel';

export type SelectionType = 'PLAN' | 'PHASE' | 'TASK';

export interface SelectionState {
  type: SelectionType;
  id: string;
  planId: string;
  phaseId?: string;
}

export function SeasonPlanPage() {
  const { farmId, planId } = useParams<{ farmId: string; planId?: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  const { plans, loading, error } = useSelector((state: RootState) => state.seasonPlan);
  const { plots } = useSelector((state: RootState) => state.plot);
  const { crops } = useSelector((state: RootState) => state.crop);
  const { user, accessToken } = useAuth();
  const canEdit = canEditPlan(user?.role, accessToken);

useEffect(() => {
      // Không fetch data nếu chưa có farm context
      if (!farmId || !accessToken) {
        console.log('[SeasonPlanPage] Waiting for farm context...');
        return;
      }
      
      // Chỉ fetch plans - plots và crops chỉ fetch khi tạo mùa vụ mới
      dispatch(fetchPlans());
    }, [dispatch, user, accessToken, farmId]);

  // Fetch plots và crops khi mở modal tạo mùa vụ
  useEffect(() => {
    if (isCreateModalOpen) {
      dispatch(fetchPlots());
      dispatch(fetchCrops());
    }
  }, [isCreateModalOpen, dispatch]);

  const farmPlans = plans.filter((p: SeasonPlan) => p.farmId === farmId || p.farmId === '');

  const currentPlan = planId ? farmPlans.find(p => p.id === planId) : null;
  const displayPlans = currentPlan ? [currentPlan] : farmPlans;

  // UI State
  const [statusFilter, setStatusFilter] = useState<PlanStatus | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [cloneSourcePlan, setCloneSourcePlan] = useState<SeasonPlan | null>(null);
  
  // Selection state (Jira style)
  const [selectedItem, setSelectedItem] = useState<SelectionState | null>(null);

  // Auto-select the plan and expand when viewing single plan
  useEffect(() => {
    if (currentPlan && !selectedItem) {
      setSelectedItem({ type: 'PLAN', id: currentPlan.id, planId: currentPlan.id });
    }
  }, [currentPlan, selectedItem]);

  const filteredPlans = displayPlans.filter((p: SeasonPlan) => {
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleCreatePlan = async (newPlanData: any) => {
    console.log('[SeasonPlanPage] handleCreatePlan called with:', newPlanData);
    try {
      await dispatch(createPlan(newPlanData)).unwrap();
      console.log('[SeasonPlanPage] createPlan succeeded');
      setIsCreateModalOpen(false);
    } catch (err) {
      console.error('[SeasonPlanPage] createPlan failed:', err);
    }
  };

  const handleUpdatePlan = (updatedPlan: SeasonPlan) => {
    dispatch(updatePlan(updatedPlan));
  };

  const handleAddPhase = (planId: string, name: string) => {
    const plan = plans.find(p => p.id === planId);
    if (!plan) return;

    const lastPhase = plan.phases[plan.phases.length - 1];
    const startDate = lastPhase ? lastPhase.endDate : plan.startDate;
    const endDate = new Date(new Date(startDate).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const newPhase: Phase = {
      id: `phase-${Date.now()}`,
      name,
      startDate,
      endDate,
      duration: 7,
      status: 'DRAFT',
      color: 'bg-indigo-500',
      tasks: []
    };

    dispatch(addPhase({ planId, phase: newPhase }));
  };

  const handleAddTask = (planId: string, phaseId: string, name: string) => {
    const plan = plans.find(p => p.id === planId);
    if (!plan) return;
    const phase = plan.phases.find(ph => ph.id === phaseId);
    if (!phase) return;

    const newTask = {
      id: `task-${Date.now()}`,
      name,
      startDate: phase.startDate,
      endDate: phase.endDate,
      duration: phase.duration,
      status: 'DRAFT' as PlanStatus
    };

    dispatch(addTask({ planId, phaseId, task: newTask }));
  };

  const getSelectedData = () => {
    if (!selectedItem) return null;
    const plan = plans.find(p => p.id === selectedItem.planId);
    if (!plan) return null;

    if (selectedItem.type === 'PLAN') return { type: 'PLAN' as const, plan };
    
    if (selectedItem.type === 'PHASE') {
      const phase = plan.phases.find(ph => ph.id === selectedItem.id);
      return phase ? { type: 'PHASE' as const, plan, phase } : null;
    }

    if (selectedItem.type === 'TASK') {
      const phase = plan.phases.find(ph => ph.id === selectedItem.phaseId);
      if (!phase) return null;
      const task = phase.tasks.find(t => t.id === selectedItem.id);
      return task ? { type: 'TASK' as const, plan, phase, task } : null;
    }

    return null;
  };

  const selectedData = getSelectedData();

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
      if (!id) return '';
      const plot = plots.find(p => p.id === id);
      return plot ? plot.name : '';
    };
  
    const getCropName = (id: string) => {
      if (!id) return '';
      const crop = crops.find(c => c.id === id);
      return crop ? crop.name : '';
    };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-slate-50 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col gap-4 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {currentPlan ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(`/farms/${farmId}/season-plans`)}
                  className="text-slate-500 hover:text-slate-700"
                >
                  <ArrowLeft size={20} />
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{currentPlan.name}</h1>
                  <div className="flex items-center gap-3 mt-1">
                    <span className={cn(
                      "px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full",
                      getStatusColor(currentPlan.status)
                    )}>
                      {getStatusLabel(currentPlan.status)}
                    </span>
                    <span className="text-sm text-slate-500">
                      {formatDate(currentPlan.startDate)} - {formatDate(currentPlan.endDate)}
                    </span>
                    {getCropName(currentPlan.cropId) && (
                      <>
                        <div className="w-1 h-1 bg-slate-300 rounded-full" />
                        <span className="text-sm font-medium text-slate-700">
                          {getCropName(currentPlan.cropId)}
                        </span>
                      </>
                    )}
                    {getPlotName(currentPlan.plotId) && (
                      <>
                        <div className="w-1 h-1 bg-slate-300 rounded-full" />
                        <span className="text-sm font-medium text-slate-700">
                          {getPlotName(currentPlan.plotId)}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Kế hoạch mùa vụ</h1>
                <p className="text-sm text-slate-500 mt-0.5">Quản lý và thiết lập kế hoạch canh tác</p>
              </div>
            )}
          </div>
          {!currentPlan && (
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
          )}
        </div>

        {!currentPlan && (
          <div className="flex items-center gap-4">
            <div className="relative group flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text"
                placeholder="Tìm nhanh kế hoạch..."
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
        )}
      </div>

      <div className="flex-1 flex overflow-hidden min-h-0 relative">
        <div className="flex-1 flex flex-col min-w-0">
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm z-50">
              <Loader2 className="animate-spin text-indigo-500 mb-4" size={48} />
              <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Đang tải dữ liệu...</p>
            </div>
          ) : error ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-4">
                <Info size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Không thể tải kế hoạch</h3>
              <p className="text-slate-500 text-sm max-w-md mb-6">{typeof error === 'string' ? error : 'Đã có lỗi xảy ra trong quá trình kết nối máy chủ.'}</p>
              <Button 
                onClick={() => dispatch(fetchPlans())}
                className="bg-slate-900 text-white hover:bg-slate-800"
              >
                Thử lại
              </Button>
            </div>
          ) : (
            <PlanTimeline 
              plans={filteredPlans}
              onSelect={(selection) => setSelectedItem(selection)}
              selectedId={selectedItem?.id}
              onUpdatePlan={handleUpdatePlan}
              onAddPhase={handleAddPhase}
              preExpandedPlanId={planId}
              user={user}
            />
          )}
        </div>

        <PlanDetailPanel 
          selection={selectedData}
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          onUpdatePlan={handleUpdatePlan}
          onUpdatePhase={(planId, phase) => dispatch(updatePhase({ planId, phase }))}
          onAddTask={handleAddTask}
          onUpdateTask={(planId, phaseId, task) => dispatch(updateTask({ planId, phaseId, task }))}
          onSelectPhase={(planId, phaseId) => setSelectedItem({ type: 'PHASE', id: phaseId, planId })}
          onSelectTask={(planId, phaseId, taskId) => setSelectedItem({ type: 'TASK', id: taskId, planId, phaseId })}
          onDeletePlan={(planId) => dispatch(removePlan(planId))}
          user={user}
        />
      </div>

      <CreatePlanModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreatePlan}
        existingPlans={plans}
      />

      {cloneSourcePlan && (
        <ClonePlanModal 
          isOpen={!!cloneSourcePlan}
          onClose={() => setCloneSourcePlan(null)}
          onClone={(newPlan) => dispatch(addPlan(newPlan))}
          plan={cloneSourcePlan}
        />
      )}
    </div>
  );
}

export default SeasonPlanPage;
