import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { 
  addPlan, 
  updatePlan, 
  addPhase,
  updatePhase,
  addTask,
  updateTask
} from '../../store/seasonPlanSlice';
import { SeasonPlan, PlanStatus, Phase } from '../../types/seasonPlan';
import { Search, ArrowLeft } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Button } from '../../components/ui/button';

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
  const dispatch = useDispatch();
  
  const { plans } = useSelector((state: RootState) => state.seasonPlan);
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
    if (currentPlan) {
      setSelectedItem({ type: 'PLAN', id: currentPlan.id, planId: currentPlan.id });
    }
  }, [currentPlan]);

  const filteredPlans = displayPlans.filter((p: SeasonPlan) => {
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleCreatePlan = (newPlanData: Omit<SeasonPlan, 'id' | 'farmId'>) => {
    const newPlan: SeasonPlan = {
      ...newPlanData,
      id: `plan-${Date.now()}`,
      farmId: farmId || '',
    };
    dispatch(addPlan(newPlan));
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
      case 'IN_PROGRESS': return 'Đang thực hiện';
      case 'COMPLETED': return 'Hoàn thành';
      case 'CANCELLED': return 'Đã hủy';
      default: return status;
    }
  };

  const getStatusColor = (status: PlanStatus) => {
    switch (status) {
      case 'DRAFT': return 'bg-slate-100 text-slate-600';
      case 'IN_PROGRESS': return 'bg-amber-100 text-amber-700';
      case 'COMPLETED': return 'bg-emerald-100 text-emerald-700';
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
              <Button 
                className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-100 transition-all font-bold px-6"
                onClick={() => setIsCreateModalOpen(true)}
              >
                + Tạo vụ mùa
              </Button>
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
            
            <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl shrink-0">
              {(['ALL', 'DRAFT', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] as const).map((status) => (
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
                  {status === 'ALL' ? 'Tất cả' : 
                   status === 'DRAFT' ? 'Bản nháp' : 
                   status === 'IN_PROGRESS' ? 'Đang thực hiện' : 
                   status === 'COMPLETED' ? 'Hoàn thành' : 'Đã hủy'}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 flex overflow-hidden min-h-0 relative">
        <div className="flex-1 flex flex-col min-w-0">
          <PlanTimeline 
            plans={filteredPlans}
            onSelect={(selection) => setSelectedItem(selection)}
            selectedId={selectedItem?.id}
            onUpdatePlan={handleUpdatePlan}
            onAddPhase={handleAddPhase}
            preExpandedPlanId={planId}
          />
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
