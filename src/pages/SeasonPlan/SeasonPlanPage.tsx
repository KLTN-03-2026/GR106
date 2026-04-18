import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { 
  addPlan,
  updatePlan, 
  fetchPlans,
  createPlan,
  deletePlan,
  fetchStages,
  fetchTasks,
  createPhase,
  removePhase,
  createSeasonTask,
  updateSeasonTask,
  removeSeasonTask
} from '../../store/seasonPlanSlice';
import { SeasonPlan, PlanStatus, Task } from '../../types/seasonPlan';
import { Search, ArrowLeft, Loader2, Info, CheckCircle2, AlertCircle } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
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

  // UI State
  const [statusFilter, setStatusFilter] = useState<PlanStatus | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [cloneSourcePlan, setCloneSourcePlan] = useState<SeasonPlan | null>(null);
  
  // Selection state (Jira style)
  const [selectedItem, setSelectedItem] = useState<SelectionState | null>(null);

  // Notification Modal state
  const [notification, setNotification] = useState<{
    isOpen: boolean;
    type: 'success' | 'error';
    title: string;
    message: string;
    details?: string[];
  }>({
    isOpen: false,
    type: 'success',
    title: '',
    message: ''
  });

  const farmPlans = plans.filter((p: SeasonPlan) => p.farmId === farmId || p.farmId === '');
  const currentPlan = planId ? farmPlans.find(p => p.id === planId) : null;
  const displayPlans = currentPlan ? [currentPlan] : farmPlans;

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
    try {
      await dispatch(createPlan(newPlanData)).unwrap();
      setIsCreateModalOpen(false);
    } catch (err) {
      console.error('[SeasonPlanPage] createPlan failed:', err);
    }
  };

  const handleUpdatePlan = (updatedPlan: SeasonPlan) => {
    dispatch(updatePlan(updatedPlan));
  };

  // --- API Workflow Orchestration ---

  // Khi chọn một Plan, tự động load các Giai đoạn (Stages)
  useEffect(() => {
    if (selectedItem?.planId) {
      dispatch(fetchStages(selectedItem.planId));
    }
  }, [selectedItem?.planId, dispatch]);

  // Khi chọn một Phase, tự động load các Công việc (Tasks)
  useEffect(() => {
    if (selectedItem?.type === 'PHASE' || selectedItem?.type === 'TASK') {
      const stageId = selectedItem.type === 'PHASE' ? selectedItem.id : selectedItem.phaseId;
      if (stageId && selectedItem.planId) {
        dispatch(fetchTasks({ planId: selectedItem.planId, stageId }));
      }
    }
  }, [selectedItem?.id, selectedItem?.phaseId, selectedItem?.type, selectedItem?.planId, dispatch]);

  const extractErrorMessage = (err: any): string => {
    if (typeof err === 'string') return err;
    if (Array.isArray(err)) {
      return err.map(e => e.message || JSON.stringify(e)).join(', ');
    }
    if (err.data && typeof err.data === 'object') {
      // Handle array of errors (like Zod errors)
      if (Array.isArray(err.data)) {
        return err.data.map((e: any) => e.message || e.code || JSON.stringify(e)).join('; ');
      }
      // Handle single error message
      return err.message || err.code || JSON.stringify(err.data);
    }
    return err.message || 'Có lỗi xảy ra';
  };

  const handleAddPhase = async (planId: string, name: string) => {
    console.log('[SeasonPlanPage] handleAddPhase triggered:', { planId, name });
    const plan = plans.find(p => p.id === planId);
    if (!plan) {
      console.error('[SeasonPlanPage] handleAddPhase: Plan not found in state:', planId);
      return;
    }

    const lastPhase = plan.phases && plan.phases.length > 0 ? plan.phases[plan.phases.length - 1] : null;
    
    const todayStr = new Date().toISOString().split('T')[0];
    
    let startDate: string;
    if (lastPhase) {
      const nextDate = new Date(lastPhase.endDate);
      nextDate.setDate(nextDate.getDate() + 1);
      startDate = nextDate.toISOString().split('T')[0];
    } else {
      startDate = plan.startDate;
    }

    // Nếu ngày bắt đầu tính toán được nằm trong quá khứ, sử dụng ngày hôm nay
    if (startDate < todayStr) {
      startDate = todayStr;
    }

    // Thời gian mặc định 1 tuần cho giai đoạn mới
    const nextEndDate = new Date(startDate);
    nextEndDate.setDate(nextEndDate.getDate() + 7);
    const calculatedEndDate = nextEndDate.toISOString().split('T')[0];

    // Cap at plan end date to avoid 400 errors from backend
    let finalEndDate = calculatedEndDate;
    if (plan.endDate && calculatedEndDate > plan.endDate) {
      finalEndDate = plan.endDate < startDate ? startDate : plan.endDate;
    }

    try {
      console.log('[SeasonPlanPage] Dispatching createPhase with dates:', { startDate, endDate: finalEndDate });
      const result = await dispatch(createPhase({ planId, data: { name, startDate, endDate: finalEndDate } })).unwrap();
      console.log('[SeasonPlanPage] createPhase successful:', result);
    } catch (err: any) {
      console.error('[SeasonPlanPage] createPhase failed:', err);
      let errorMsg = 'Thời gian bị trùng hoặc không hợp lệ';
      let details: string[] = [];
      
      if (err && typeof err === 'object') {
        if (err.message) errorMsg = err.message;
        if (err.data && typeof err.data === 'object') {
          details = Object.entries(err.data).map(([key, val]: [string, any]) => {
            const valStr = typeof val === 'object' ? JSON.stringify(val) : String(val);
            return `${key}: ${valStr}`;
          });
        }
      }

      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Lỗi tạo giai đoạn',
        message: errorMsg,
        details: details.length > 0 ? details : undefined
      });
    }
  };

  const handleAddTask = async (planId: string, phaseId: string, name: string) => {
    console.log('[SeasonPlanPage] handleAddTask initiated:', { planId, phaseId, name });
    const plan = plans.find(p => p.id === planId);
    if (!plan) {
      console.error('[SeasonPlanPage] handleAddTask: Plan not found in local state', planId);
      return;
    }
    const phase = plan.phases?.find(ph => ph.id === phaseId);
    if (!phase) {
      console.error('[SeasonPlanPage] handleAddTask: Phase not found in local state', phaseId);
      return;
    }

    try {
      // Đảm bảo plotId là một chuỗi UUID hợp lệ, không để null lọt qua
      const plotId = (typeof plan.plotId === 'string' && plan.plotId.length === 36) 
        ? plan.plotId 
        : "00000000-0000-0000-0000-000000000000";

      const todayStr = new Date().toISOString().split('T')[0];
      
      // Kiểm tra xem Giai đoạn có nằm trong quá khứ không
      if (phase.endDate < todayStr) {
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Giai đoạn đã quá hạn',
          message: `Giai đoạn "${phase.name}" đã kết thúc vào ngày ${phase.endDate}. Bạn không thể thêm công việc mới vào giai đoạn đã qua. Hãy tạo một giai đoạn mới hoặc điều chỉnh thời gian của giai đoạn này.`
        });
        return;
      }

      // Đối với các giai đoạn đang diễn ra nhưng có ngày bắt đầu cũ, ta lấy max(startDate, today)
      const taskStartDate = phase.startDate < todayStr ? todayStr : phase.startDate;
      const taskEndDate = phase.endDate;

      const payload = { 
        name, 
        description: '', 
        startDate: taskStartDate, 
        endDate: taskEndDate,
        plotId 
      };

      console.log('[SeasonPlanPage] createSeasonTask payload:', JSON.stringify(payload, null, 2));

      const result = await dispatch(createSeasonTask({ 
        planId, 
        stageId: phaseId, 
        data: payload
      })).unwrap();

      console.log('[SeasonPlanPage] createSeasonTask success:', result);
    } catch (err: any) {
      console.error('[SeasonPlanPage] createSeasonTask failed. Error object:', err);
      let errorMsg = 'Dữ liệu đầu vào không hợp lệ hoặc thiếu thông tin bắt buộc';
      let details: string[] = [];
      
      if (Array.isArray(err)) {
        // Handle array of Zod errors or similar
        details = err.map((e: any) => `${e.path?.join('.') || 'error'}: ${e.message}`);
      } else if (err && typeof err === 'object') {
        if (err.message) errorMsg = err.message;
        if (err.data && typeof err.data === 'object') {
          details = Object.entries(err.data).map(([key, val]: [string, any]) => {
            const valStr = typeof val === 'object' ? JSON.stringify(val) : String(val);
            return `${key}: ${valStr}`;
          });
        }
      } else if (typeof err === 'string') {
        errorMsg = err;
      }

      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Lỗi tạo công việc',
        message: errorMsg,
        details: details.length > 0 ? details : undefined
      });
    }
  };

  const handleDeletePhase = async (planId: string, stageId: string) => {
    try {
      await dispatch(removePhase({ planId, stageId })).unwrap();
      setSelectedItem(null);
    } catch (err: any) {
      console.error('[SeasonPlanPage] deletePhase failed:', err);
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Lỗi xóa giai đoạn',
        message: err.message || 'Không thể xóa giai đoạn này'
      });
    }
  };

  const handleDeleteTask = async (planId: string, stageId: string, taskId: string) => {
    try {
      await dispatch(removeSeasonTask({ planId, stageId, taskId })).unwrap();
      // Since we are in the panel, if we delete the task, we might want to select the phase instead
      setSelectedItem({ type: 'PHASE', id: stageId, planId: planId! });
    } catch (err: any) {
      console.error('[SeasonPlanPage] deleteTask failed:', err);
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Lỗi xóa công việc',
        message: err.message || 'Không thể xóa công việc này'
      });
    }
  };

  const handleUpdateTask = async (planId: string, stageId: string, task: Task) => {
    try {
      // Find the plan to get the real plotId
      const plan = plans.find(p => p.id === planId);
      
      // Create a clean payload for the update
      const data = {
        name: task.name,
        description: task.description || '',
        startDate: task.startDate,
        endDate: task.endDate,
        plotId: task.plotId || plan?.plotId || '',
        progressPercent: task.progressPercent
      };
      await dispatch(updateSeasonTask({ planId, stageId, taskId: task.id, data })).unwrap();
    } catch (err: any) {
      console.error('[SeasonPlanPage] updateTask failed:', err);
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Lỗi cập nhật',
        message: extractErrorMessage(err)
      });
    }
  };

  const getSelectedData = () => {
    if (!selectedItem) return null;
    const plan = plans.find(p => p.id === selectedItem.planId);
    if (!plan) return null;

    if (selectedItem.type === 'PLAN') return { type: 'PLAN' as const, plan };
    
    if (selectedItem.type === 'PHASE') {
      const phase = plan.phases?.find(ph => ph.id === selectedItem.id);
      return phase ? { type: 'PHASE' as const, plan, phase } : null;
    }

    if (selectedItem.type === 'TASK') {
      const phase = plan.phases?.find(ph => ph.id === selectedItem.phaseId);
      if (!phase) return null;
      const task = phase.tasks?.find(t => t.id === selectedItem.id);
      return task ? { type: 'TASK' as const, plan, phase, task } : null;
    }

    return null;
  };

  const selectedData = getSelectedData();

  const getStatusLabel = (status: PlanStatus | any) => {
    const code = typeof status === 'string' ? status : status?.code;
    const name = typeof status === 'string' ? null : status?.name;
    if (name) return name;

    switch (code) {
      case 'DRAFT': return 'Bản nháp';
      case 'ACTIVE': return 'Đang thực hiện';
      case 'READY_TO_HARVEST': return 'Sẵn sàng thu hoạch';
      case 'HARVESTING': return 'Đang thu hoạch';
      case 'COMPLETED': return 'Hoàn thành';
      case 'CANCELLED': return 'Đã hủy';
      case 'ASSIGNED': return 'Đã giao việc';
      case 'IN_PROGRESS': return 'Đang thực hiện';
      case 'OVERDUE': return 'Trễ hạn';
      default: return code || 'N/A';
    }
  };

  const getStatusColor = (status: PlanStatus | any) => {
    const code = typeof status === 'string' ? status : status?.code;
    
    switch (code) {
      case 'DRAFT': return 'bg-slate-100 text-slate-600';
      case 'ACTIVE':
      case 'IN_PROGRESS': return 'bg-indigo-100 text-indigo-700';
      case 'READY_TO_HARVEST': return 'bg-lime-100 text-lime-700';
      case 'HARVESTING': return 'bg-emerald-100 text-emerald-700';
      case 'COMPLETED': return 'bg-slate-100 text-slate-400';
      case 'OVERDUE': return 'bg-rose-100 text-rose-700';
      case 'ASSIGNED': return 'bg-blue-100 text-blue-700';
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
              canEdit={canEdit}
            />
          )}
        </div>

        <PlanDetailPanel 
          isOpen={!!selectedItem}
          selection={selectedData}
          onClose={() => setSelectedItem(null)}
          onUpdatePlan={handleUpdatePlan}
          onUpdatePhase={(_id, phase) => {
            // Note: stage update API not in provided list, but we can handle local if needed
            console.log('Update phase:', phase);
          }}
          onDeletePhase={handleDeletePhase}
          onAddTask={handleAddTask}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={handleDeleteTask}
          onSelectPhase={(_id, phaseId) => setSelectedItem({ type: 'PHASE', id: phaseId, planId: planId! })}
          onSelectTask={(_pid, stageId, taskId) => setSelectedItem({ type: 'TASK', id: taskId, phaseId: stageId, planId: planId! })}
          onDeletePlan={(id) => dispatch(deletePlan(id))}
          onClone={(p) => setCloneSourcePlan(p)}
          canEdit={canEdit}
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

      {/* Notification Modal */}
      <Modal 
        isOpen={notification.isOpen} 
        onClose={() => setNotification(prev => ({ ...prev, isOpen: false }))}
      >
        <div className="bg-white rounded-[32px] p-8 w-full max-w-sm overflow-hidden border border-slate-100 shadow-2xl">
          <div className="flex flex-col items-center text-center">
            <div className={cn(
              "w-20 h-20 rounded-3xl flex items-center justify-center mb-6",
              notification.type === 'success' ? "bg-emerald-50 text-emerald-500" : "bg-rose-50 text-rose-500"
            )}>
              {notification.type === 'success' ? <CheckCircle2 size={40} /> : <AlertCircle size={40} />}
            </div>
            
            <h3 className="text-xl font-black text-slate-800 tracking-tight mb-2">
              {notification.title}
            </h3>
            
            <p className="text-sm font-medium text-slate-500 mb-6 leading-relaxed">
              {notification.message}
            </p>

            {notification.details && notification.details.length > 0 && (
              <div className="w-full bg-slate-50 rounded-2xl p-4 mb-6 text-left">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Chi tiết lỗi:</p>
                <ul className="space-y-1">
                  {notification.details.map((detail, idx) => (
                    <li key={idx} className="text-xs text-rose-600 font-bold flex items-start gap-2">
                      <div className="w-1 h-1 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Button
              onClick={() => setNotification(prev => ({ ...prev, isOpen: false }))}
              className={cn(
                "w-full py-6 rounded-2xl font-black uppercase tracking-wider text-white border-none shadow-lg",
                notification.type === 'success' ? "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-100" : "bg-slate-900 hover:bg-slate-800 shadow-slate-100"
              )}
            >
              Đóng
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default SeasonPlanPage;
