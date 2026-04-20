import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import {
  addPlan,
  updatePlanTime,
  fetchPlans,
  createPlan,
  removePlan,
  fetchStages,
  createPhase,
  removePhase,
  fetchTasks,
  updatePhase,
  updatePhaseTime,
  createSeasonTask,
  updateSeasonTask,
  updateTaskTime,
  removeSeasonTask,
  addPlotsToPlan,
  fetchPlanPlots,
} from '../../store/seasonPlanSlice';
import { SeasonPlan, PlanStatus, Task } from '../../types/seasonPlan';
import {
  Search,
  ArrowLeft,
  Loader2,
  Info,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Settings2,
  LayoutGrid,
  List,
  CalendarDays,
  GitBranch,
  Target,
  Code2,
  Archive,
  BookOpen,
  Link2,
  MoreHorizontal,
  Share2,
  Zap,
  Bell,
} from 'lucide-react';

import { Modal } from '../../components/ui/Modal';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
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
import { CreatePhaseModal } from './components/CreatePhaseModal';

// ─── Types ────────────────────────────────────────────────────────────────────

export type SelectionType = 'PLAN' | 'PHASE' | 'TASK';

export interface SelectionState {
  type: SelectionType;
  id: string;
  planId: string;
  phaseId?: string;
}

// ─── Nav tabs (Jira-style project nav) ────────────────────────────────────────

const NAV_TABS = [
  { key: 'summary', label: 'Tổng quan', icon: LayoutGrid },
  { key: 'timeline', label: 'Timeline', icon: CalendarDays },
  { key: 'backlog', label: 'Backlog', icon: List },
  { key: 'board', label: 'Bảng', icon: GitBranch },
  { key: 'calendar', label: 'Lịch', icon: CalendarDays },
  { key: 'goals', label: 'Mục tiêu', icon: Target },
  { key: 'code', label: 'Phát triển', icon: Code2 },
  { key: 'archive', label: 'Lưu trữ', icon: Archive },
  { key: 'pages', label: 'Trang', icon: BookOpen },
  { key: 'shortcuts', label: 'Phím tắt', icon: Link2 },
] as const;

type NavTab = typeof NAV_TABS[number]['key'];

// ─── Status helpers ───────────────────────────────────────────────────────────

function getStatusLabel(status: PlanStatus | any): string {
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
}

function getStatusColor(status: PlanStatus | any): string {
  const code = typeof status === 'string' ? status : status?.code;
  switch (code) {
    case 'DRAFT': return 'bg-slate-100 text-slate-600';
    case 'ACTIVE':
    case 'IN_PROGRESS': return 'bg-blue-100 text-blue-700';
    case 'READY_TO_HARVEST': return 'bg-lime-100 text-lime-700';
    case 'HARVESTING': return 'bg-emerald-100 text-emerald-700';
    case 'COMPLETED': return 'bg-slate-100 text-slate-400';
    case 'OVERDUE': return 'bg-rose-100 text-rose-700';
    case 'ASSIGNED': return 'bg-violet-100 text-violet-700';
    case 'CANCELLED': return 'bg-red-100 text-red-700';
    default: return 'bg-slate-100 text-slate-600';
  }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    day: 'numeric', month: 'numeric', year: 'numeric',
  });
}

function getPlanPlotNames(p: SeasonPlan): string {
  if (p.plots && p.plots.length > 0) return p.plots.map(i => i.plotName).join(', ');
  return '';
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SeasonPlanPage() {
  const { farmId, planId } = useParams<{ farmId: string; planId?: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { plans, loading, error } = useSelector((state: RootState) => state.seasonPlan);
  const { plots } = useSelector((state: RootState) => state.plot);
  const { user, accessToken } = useAuth();
  const canEdit = canEditPlan(user?.role, accessToken);

  // ── UI state ──────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<NavTab>('timeline');
  const [statusFilter, setStatusFilter] = useState<PlanStatus | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // ── Modal state ───────────────────────────────────────────────────────────
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [cloneSourcePlan, setCloneSourcePlan] = useState<SeasonPlan | null>(null);
  const [isCreatePhaseModalOpen, setIsCreatePhaseModalOpen] = useState(false);
  const [phaseModalTargetPlanId, setPhaseModalTargetPlanId] = useState<string | null>(null);
  const [phaseModalInitialData, setPhaseModalInitialData] = useState<
    { name: string; startDate: string; endDate: string } | undefined
  >(undefined);
  const [isPhaseSaving, setIsPhaseSaving] = useState(false);

  // ── Selection ─────────────────────────────────────────────────────────────
  const [selectedItem, setSelectedItem] = useState<SelectionState | null>(null);

  // ── Notification ──────────────────────────────────────────────────────────
  const [notification, setNotification] = useState<{
    isOpen: boolean;
    type: 'success' | 'error';
    title: string;
    message: string;
    details?: string[];
  }>({ isOpen: false, type: 'success', title: '', message: '' });

  // ── Delete confirm ────────────────────────────────────────────────────────
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean; planId: string | null; isDeleting: boolean;
  }>({ isOpen: false, planId: null, isDeleting: false });

  // ── Derived data ──────────────────────────────────────────────────────────
  const farmPlans = plans.filter((p: SeasonPlan) => p.farmId === farmId || p.farmId === '');
  const currentPlan = planId ? farmPlans.find(p => p.id === planId) : null;
  const displayPlans = currentPlan ? [currentPlan] : farmPlans;

  const filteredPlans = displayPlans.filter((p: SeasonPlan) => {
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // ── Effects ───────────────────────────────────────────────────────────────
  useEffect(() => {
    dispatch(fetchPlans());
    if (farmId) {
      dispatch(fetchPlots(farmId));
    }
    dispatch(fetchCrops());
  }, [dispatch, accessToken, farmId]);

  useEffect(() => {
    if (isCreateModalOpen && farmId) {
      dispatch(fetchPlots(farmId));
      dispatch(fetchCrops());
    }
  }, [isCreateModalOpen, dispatch, farmId]);



  // Auto-switch to timeline tab when viewing a single plan
  // Reset khi chuyển plan
  // Chỉ auto-open panel khi lần đầu vào trang (currentPlan?.id thay đổi)
  useEffect(() => {
    if (currentPlan) {
      setActiveTab('timeline');
      setSelectedItem({ type: 'PLAN', id: currentPlan.id, planId: currentPlan.id });
    }
  }, [currentPlan?.id]); // chỉ chạy khi ID plan thay đổi, không phụ thuộc selectedItem

  useEffect(() => {
    if (selectedItem?.planId) {
      dispatch(fetchStages(selectedItem.planId));
      dispatch(fetchPlanPlots(selectedItem.planId));
    }
  }, [selectedItem?.planId, dispatch]);

  useEffect(() => {
    if (selectedItem?.type === 'PHASE' || selectedItem?.type === 'TASK') {
      const stageId = selectedItem.type === 'PHASE' ? selectedItem.id : selectedItem.phaseId;
      if (stageId && selectedItem.planId) {
        dispatch(fetchTasks({ planId: selectedItem.planId, stageId }));
      }
    }
  }, [selectedItem?.id, selectedItem?.phaseId, selectedItem?.type, selectedItem?.planId, dispatch]);

  // ── Error helper ──────────────────────────────────────────────────────────
  const extractErrorMessage = (err: any): string => {
    if (typeof err === 'string') return err;
    if (Array.isArray(err)) return err.map(e => e.message || JSON.stringify(e)).join(', ');
    
    // Handle error object from standard ApiResponse
    if (err.message && typeof err.message === 'string') {
      if (err.data && typeof err.data === 'object' && !Array.isArray(err.data)) {
        // If there are detailed validation errors in data
        const details = Object.values(err.data).join('; ');
        if (details) return `${err.message}: ${details}`;
      }
      return err.message;
    }

    if (err.data && typeof err.data === 'object') {
      if (Array.isArray(err.data))
        return err.data.map((e: any) => e.message || e.code || JSON.stringify(e)).join('; ');
      return err.message || err.code || JSON.stringify(err.data);
    }
    
    return err.message || 'Có lỗi xảy ra';
  };

  const showError = (title: string, err: any) =>
    setNotification({ isOpen: true, type: 'error', title, message: extractErrorMessage(err) });

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleCreatePlan = async (newPlanData: any) => {
    try {
      const { plotId, ...planPayload } = newPlanData;
      const plan = await dispatch(createPlan(planPayload)).unwrap();
      if (plotId && plan.id) {
        await dispatch(addPlotsToPlan({ planId: plan.id, plotIds: [plotId] })).unwrap();
        dispatch(fetchPlanPlots(plan.id));
      }
      setIsCreateModalOpen(false);
      setNotification({
        isOpen: true, type: 'success',
        title: 'Thành công',
        message: 'Kế hoạch mùa vụ đã được khởi tạo và liên kết lô đất',
      });
    } catch (err: any) {
      showError('Lỗi khởi tạo', err);
    }
  };

  const handleUpdatePlan = async (updatedPlan: SeasonPlan) => {
    try {
      const original = plans.find(p => p.id === updatedPlan.id);
      if (!original) return;

      const isDateChanged = 
        original.startDate !== updatedPlan.startDate || 
        original.endDate !== updatedPlan.endDate;

      // Cập nhật ngày bắt đầu và kết thúc → PUT /api/v1/plans/{planId}/time
      if (isDateChanged) {
        await dispatch(updatePlanTime({
          planId: updatedPlan.id,
          startDate: updatedPlan.startDate,
          endDate: updatedPlan.endDate
        })).unwrap();
      }
    } catch (err: any) {
      showError('Lỗi cập nhật kế hoạch', err);
    }
  };

  const handleExpandPhase = (planId: string, phaseId: string) => {
    dispatch(fetchTasks({ planId, stageId: phaseId }));
  };

  const handleUpdatePhase = async (planId: string, stageId: string, data: { name: string; startDate: string; endDate: string }, originalPhase?: any) => {
    try {
      if (!originalPhase) {
        await dispatch(updatePhase({ planId, stageId, data })).unwrap();
        return;
      }

      const isDateChanged = originalPhase.startDate !== data.startDate || originalPhase.endDate !== data.endDate;
      const isNameChanged = originalPhase.name !== data.name;

      if (isDateChanged) {
        await dispatch(updatePhaseTime({ planId, stageId, data: { startDate: data.startDate, endDate: data.endDate } })).unwrap();
      }

      if (isNameChanged) {
        await dispatch(updatePhase({ planId, stageId, data })).unwrap();
      }
    } catch (err: any) {
      showError('Lỗi cập nhật giai đoạn', err);
    }
  };

  // handleUpdatePhaseTime removed to clear warning

  const handleDeletePlan = (planId: string) =>
    setDeleteConfirm({ isOpen: true, planId, isDeleting: false });

  const confirmDelete = async () => {
    if (!deleteConfirm.planId) return;
    setDeleteConfirm(prev => ({ ...prev, isDeleting: true }));
    try {
      await dispatch(removePlan(deleteConfirm.planId)).unwrap();
      setSelectedItem(null);
      if (deleteConfirm.planId === currentPlan?.id)
        navigate(`/farms/${farmId}/season-plans`);
      setDeleteConfirm({ isOpen: false, planId: null, isDeleting: false });
    } catch (err: any) {
      setDeleteConfirm(prev => ({ ...prev, isDeleting: false, isOpen: false }));
      showError('Lỗi xóa kế hoạch', err);
    }
  };

  const handleAddPhase = (planId: string) => {
    const plan = plans.find(p => p.id === planId);
    if (!plan) return;
    const lastPhase = plan.phases && plan.phases.length > 0 ? plan.phases[plan.phases.length - 1] : null;
    const todayStr = new Date().toISOString().split('T')[0];
    let startDate: string;
    if (lastPhase) {
      const next = new Date(lastPhase.endDate);
      next.setDate(next.getDate() + 1);
      startDate = next.toISOString().split('T')[0];
    } else {
      startDate = plan.startDate;
    }
    if (startDate < todayStr) startDate = todayStr;
    const nextEnd = new Date(startDate);
    nextEnd.setDate(nextEnd.getDate() + 7);
    let endDate = nextEnd.toISOString().split('T')[0];
    if (plan.endDate && endDate > plan.endDate)
      endDate = plan.endDate < startDate ? startDate : plan.endDate;

    setPhaseModalTargetPlanId(planId);
    setPhaseModalInitialData({ name: '', startDate, endDate });
    setIsCreatePhaseModalOpen(true);
  };

  const handleSaveNewPhase = async (data: { name: string; startDate: string; endDate: string }) => {
    if (!phaseModalTargetPlanId) return;
    setIsPhaseSaving(true);
    try {
      await dispatch(createPhase({ planId: phaseModalTargetPlanId, data })).unwrap();
      setIsCreatePhaseModalOpen(false);
      setPhaseModalTargetPlanId(null);
    } catch (err: any) {
      let errorMsg = 'Thời gian bị trùng hoặc không hợp lệ';
      let details: string[] = [];
      if (err?.message) errorMsg = err.message;
      if (err?.data && typeof err.data === 'object') {
        details = Object.entries(err.data).map(([k, v]: [string, any]) =>
          `${k}: ${typeof v === 'object' ? JSON.stringify(v) : String(v)}`);
      }
      setNotification({ isOpen: true, type: 'error', title: 'Lỗi tạo giai đoạn', message: errorMsg, details: details.length ? details : undefined });
    } finally {
      setIsPhaseSaving(false);
    }
  };

  const handleAddTask = async (
    planId: string,
    phaseId: string,
    data: { name: string; description: string; startDate: string; endDate: string; plotId?: string },
  ) => {
    const plan = plans.find(p => p.id === planId);
    const phase = plan?.phases?.find(ph => ph.id === phaseId);
    if (!plan || !phase) return;

    let plotId = data.plotId;
    if (!plotId && plan.plots?.length) plotId = plan.plots[0].plotId;
    
    if (!plotId) {
      setNotification({ 
        isOpen: true, 
        type: 'error', 
        title: 'Thiếu thông tin lô đất', 
        message: 'Kế hoạch này chưa được gán lô đất nào. Vui lòng gán lô đất cho kế hoạch trước khi tạo công việc.' 
      });
      return;
    }
    try {
      await dispatch(createSeasonTask({ planId, stageId: phaseId, data: { ...data, plotId } })).unwrap();
    } catch (err: any) {
      let errorMsg = 'Dữ liệu đầu vào không hợp lệ';
      let details: string[] = [];
      if (Array.isArray(err)) {
        details = err.map((e: any) => `${e.path?.join('.') || 'error'}: ${e.message}`);
      } else if (err?.message) {
        errorMsg = err.message;
        if (err?.data && typeof err.data === 'object')
          details = Object.entries(err.data).map(([k, v]: [string, any]) =>
            `${k}: ${typeof v === 'object' ? JSON.stringify(v) : String(v)}`);
      }
      setNotification({ isOpen: true, type: 'error', title: 'Lỗi tạo công việc', message: errorMsg, details: details.length ? details : undefined });
    }
  };

  const handleDeletePhase = async (planId: string, stageId: string) => {
    try {
      await dispatch(removePhase({ planId, stageId })).unwrap();
      setSelectedItem(null);
    } catch (err: any) {
      showError('Lỗi xóa giai đoạn', err);
    }
  };

  const handleDeleteTask = async (planId: string, stageId: string, taskId: string) => {
    try {
      await dispatch(removeSeasonTask({ planId, stageId, taskId })).unwrap();
      setSelectedItem({ type: 'PHASE', id: stageId, planId });
    } catch (err: any) {
      showError('Lỗi xóa công việc', err);
    }
  };

  const handleAddPlotsToPlan = async (planId: string, plotIds: string[]) => {
    try {
      await dispatch(addPlotsToPlan({ planId, plotIds })).unwrap();
    } catch (err: any) {
      showError('Lỗi thêm lô đất', err);
    }
  };


  const handleUpdateTask = async (planId: string, stageId: string, task: Task, originalTask?: Task) => {
    const plan = plans.find(p => p.id === planId);
    const plotId = task.plotId || (plan?.plots?.length ? plan.plots[0].plotId : undefined);
    if (!plotId) {
      setNotification({ 
        isOpen: true, 
        type: 'error', 
        title: 'Thiếu thông tin lô đất', 
        message: 'Công việc này thiếu thông tin lô đất và kế hoạch không có lô đất mặc định.' 
      });
      return;
    }
    try {
      if (!originalTask) {
        await dispatch(updateSeasonTask({
          planId, stageId, taskId: task.id,
          data: { name: task.name, description: task.description || '', startDate: task.startDate, endDate: task.endDate, plotId },
        })).unwrap();
        return;
      }

      const isDateChanged = originalTask.startDate !== task.startDate || originalTask.endDate !== task.endDate;
      const isNameChanged = originalTask.name !== task.name || originalTask.description !== task.description;

      if (isDateChanged) {
        await dispatch(updateTaskTime({
          planId, stageId, taskId: task.id,
          data: { startDate: task.startDate, endDate: task.endDate },
        })).unwrap();
      }

      if (isNameChanged) {
        await dispatch(updateSeasonTask({
          planId, stageId, taskId: task.id,
          data: { name: task.name, description: task.description || '', startDate: task.startDate, endDate: task.endDate, plotId },
        })).unwrap();
      }
    } catch (err: any) {
      showError('Lỗi cập nhật', err);
    }
  };

  // ── Selected data resolver ────────────────────────────────────────────────
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
      const task = phase?.tasks?.find(t => t.id === selectedItem.id);
      return task ? { type: 'TASK' as const, plan, phase: phase!, task } : null;
    }
    return null;
  };

  const selectedData = getSelectedData();

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-white">

      {/* ════════════════════════════════════════════════════════
          TOP BAR  (Jira-style: project name + action icons)
      ════════════════════════════════════════════════════════ */}
      <div className="flex items-center gap-3 px-5 py-2.5 border-b border-slate-200 bg-white shrink-0">
        {/* Back button when inside a single plan */}
        {currentPlan && (
          <button
            onClick={() => navigate(`/farms/${farmId}/season-plans`)}
            className="p-1.5 rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
        )}

        {/* Project icon + name */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0 shadow-sm">
            <Zap size={14} className="text-white" fill="currentColor" />
          </div>
          <div className="min-w-0">
            <h1 className="text-[14px] font-bold text-slate-900 leading-tight truncate">
              {currentPlan ? currentPlan.name : 'Kế hoạch mùa vụ'}
            </h1>
            {currentPlan && (
              <div className="flex items-center gap-2 mt-0.5">
                <span className={cn(
                  'px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full whitespace-nowrap inline-flex items-center justify-center',
                  getStatusColor(currentPlan.status),
                )}>
                  {getStatusLabel(currentPlan.status)}
                </span>
                <span className="text-[11px] text-slate-400">
                  {formatDate(currentPlan.startDate)} — {formatDate(currentPlan.endDate)}
                </span>
                {getPlanPlotNames(currentPlan) && (
                  <span className="text-[11px] font-medium text-slate-500">
                    · {getPlanPlotNames(currentPlan)}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Action icons (right side — like Jira) */}
        <div className="flex items-center gap-1">
          {canEdit && !currentPlan && (
            <Button
              className="h-7 px-3 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-md shadow-none"
              onClick={() => setIsCreateModalOpen(true)}
            >
              + Tạo vụ mùa
            </Button>
          )}
          {canEdit && currentPlan && (
            <button
              className="h-7 px-2.5 text-[11px] font-bold text-rose-500 border border-rose-200 rounded-md hover:bg-rose-50 flex items-center gap-1.5 transition-colors"
              onClick={() => handleDeletePlan(currentPlan.id)}
            >
              <Trash2 size={13} />
              Xóa
            </button>
          )}
          {!canEdit && (
            <div className="flex items-center gap-1.5 px-3 h-7 bg-slate-100 rounded-md text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <Info size={12} /> Chỉ xem
            </div>
          )}
          <button className="p-1.5 rounded-md text-slate-400 hover:bg-slate-100 transition-colors"><Share2 size={15} /></button>
          <button className="p-1.5 rounded-md text-slate-400 hover:bg-slate-100 transition-colors"><Bell size={15} /></button>
          <button className="p-1.5 rounded-md text-slate-400 hover:bg-slate-100 transition-colors"

            onClick={() => setSelectedItem(currentPlan ? { type: 'PLAN', id: currentPlan.id, planId: currentPlan.id } : null)}
          ><Settings2 size={15} />

          </button>
          <button className="p-1.5 rounded-md text-slate-400 hover:bg-slate-100 transition-colors"><MoreHorizontal size={15} /></button>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════
          NAV TABS  (Summary | Timeline | Backlog | Board …)
      ════════════════════════════════════════════════════════ */}
      <div className="flex items-end gap-0 px-4 border-b border-slate-200 bg-white shrink-0 overflow-x-auto no-scrollbar">
        {NAV_TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2.5 text-[12px] font-medium border-b-2 whitespace-nowrap transition-all',
                isActive
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300',
              )}
            >
              <Icon size={13} />
              {tab.label}
            </button>
          );
        })}
        {/* Add tab */}
        <button className="flex items-center gap-1 px-3 py-2.5 text-[12px] text-slate-400 hover:text-slate-700 border-b-2 border-transparent whitespace-nowrap ml-1">
          <span className="text-lg leading-none">+</span>
        </button>
      </div>

      {/* ════════════════════════════════════════════════════════
          TIMELINE TAB TOOLBAR  (search + status filters)
          — only shown on timeline tab and when not in single plan
      ════════════════════════════════════════════════════════ */}
      {activeTab === 'timeline' && !currentPlan && (
        <div className="flex items-center gap-3 px-4 py-2 bg-white border-b border-slate-100 shrink-0">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
            <input
              type="text"
              placeholder="Tìm kiếm kế hoạch..."
              className="pl-8 pr-3 py-1.5 text-[12px] bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 focus:bg-white outline-none transition-all w-52"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Epic / Type / Status filters — Jira filter pills */}
          <div className="flex items-center gap-1.5">
            {/* Avatar chips placeholder */}
            <div className="flex items-center -space-x-1">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-6 h-6 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center text-[9px] font-bold text-indigo-600">
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>

            {/* Status filter pills */}
            <div className="flex items-center gap-1 ml-2">
              {(['ALL', 'DRAFT', 'ACTIVE', 'READY_TO_HARVEST', 'HARVESTING', 'COMPLETED', 'CANCELLED'] as const).map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={cn(
                    'px-2.5 py-1 text-[11px] font-medium rounded border transition-all',
                    statusFilter === status
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400 hover:text-slate-900',
                  )}
                >
                  {status === 'ALL' ? 'Tất cả' : getStatusLabel(status)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1" />

          {/* Group by placeholder */}
          <button className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium text-slate-600 border border-slate-200 rounded hover:border-slate-400 transition-colors bg-white">
            <Settings2 size={12} />
            Nhóm theo
          </button>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════
          MAIN CONTENT AREA
      ════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex overflow-hidden min-h-0 relative">

        {/* ── Tab: Timeline ── */}
        {activeTab === 'timeline' && (
          <>
            <div className="flex-1 flex flex-col min-w-0 min-h-0">
              {loading ? (
                <div className="flex-1 flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm">
                  <Loader2 className="animate-spin text-indigo-500 mb-3" size={36} />
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Đang tải...</p>
                </div>
              ) : error ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white">
                  <div className="w-14 h-14 bg-red-50 text-red-400 rounded-2xl flex items-center justify-center mb-4">
                    <Info size={28} />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">Không thể tải kế hoạch</h3>
                  <p className="text-slate-500 text-sm max-w-md mb-5">
                    {typeof error === 'string' ? error : 'Đã có lỗi xảy ra khi kết nối máy chủ.'}
                  </p>
                  <Button onClick={() => dispatch(fetchPlans())} className="bg-slate-900 text-white hover:bg-slate-800 h-8 text-sm">
                    Thử lại
                  </Button>
                </div>
              ) : (
                <PlanTimeline
                  plans={filteredPlans}
                  onSelect={selection => setSelectedItem(selection)}
                  selectedId={selectedItem?.id}
                  onUpdatePlan={handleUpdatePlan}
                  onDeletePlan={handleDeletePlan}
                  onAddPhase={handleAddPhase}
                  onExpandPhase={handleExpandPhase}
                  preExpandedPlanId={planId}
                  canEdit={canEdit}
                />
              )}
            </div>

            {/* Detail side panel */}
            <PlanDetailPanel
              isOpen={!!selectedItem}
              selection={selectedData}
              plots={plots}
              onClose={() => {
                setSelectedItem(null);
              }}
              onUpdatePlan={handleUpdatePlan}
              onUpdatePhase={(id, phase) => {
                const originalPhase = selectedData?.type === 'PHASE' ? selectedData.phase : null;
                handleUpdatePhase(id, phase.id, {
                  name: phase.name,
                  startDate: phase.startDate,
                  endDate: phase.endDate
                }, originalPhase);
              }}
              onDeletePhase={handleDeletePhase}
              onAddTask={handleAddTask}
              onUpdateTask={handleUpdateTask}
              onDeleteTask={handleDeleteTask}
              onSelectPhase={(_id, phaseId) =>
                setSelectedItem({ type: 'PHASE', id: phaseId, planId: planId! })}
              onSelectTask={(_pid, stageId, taskId) =>
                setSelectedItem({ type: 'TASK', id: taskId, phaseId: stageId, planId: planId! })}
              onDeletePlan={handleDeletePlan}
              onClone={p => setCloneSourcePlan(p)}
              onAddPlots={handleAddPlotsToPlan}
              canEdit={canEdit}
            />
          </>
        )}

        {/* ── Other tabs: placeholder ── */}
        {activeTab !== 'timeline' && (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-slate-50/50">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
              {(() => {
                const tab = NAV_TABS.find(t => t.key === activeTab);
                const Icon = tab?.icon ?? LayoutGrid;
                return <Icon size={28} className="text-slate-400" />;
              })()}
            </div>
            <p className="text-[13px] font-bold text-slate-600 mb-1">
              {NAV_TABS.find(t => t.key === activeTab)?.label}
            </p>
            <p className="text-[12px] text-slate-400 max-w-xs">
              Tính năng này đang được phát triển. Chuyển sang tab <strong>Timeline</strong> để quản lý kế hoạch mùa vụ.
            </p>
            <button
              className="mt-4 px-4 py-1.5 text-[12px] font-bold text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors"
              onClick={() => setActiveTab('timeline')}
            >
              Xem Timeline
            </button>
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════
          MODALS
      ════════════════════════════════════════════════════════ */}
      <CreatePlanModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreatePlan}
      />

      <CreatePhaseModal
        isOpen={isCreatePhaseModalOpen}
        onClose={() => setIsCreatePhaseModalOpen(false)}
        onSave={handleSaveNewPhase}
        initialData={phaseModalInitialData}
        isLoading={isPhaseSaving}
      />

      {cloneSourcePlan && (
        <ClonePlanModal
          isOpen
          onClose={() => setCloneSourcePlan(null)}
          onClone={newPlan => dispatch(addPlan(newPlan))}
          plan={cloneSourcePlan}
        />
      )}

      {/* Notification modal */}
      <Modal
        isOpen={notification.isOpen}
        onClose={() => setNotification(prev => ({ ...prev, isOpen: false }))}
      >
        <div className="bg-white rounded-[28px] p-8 w-full max-w-sm border border-slate-100 shadow-2xl">
          <div className="flex flex-col items-center text-center">
            <div className={cn(
              'w-16 h-16 rounded-2xl flex items-center justify-center mb-5',
              notification.type === 'success' ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500',
            )}>
              {notification.type === 'success'
                ? <CheckCircle2 size={32} />
                : <AlertCircle size={32} />}
            </div>
            <h3 className="text-lg font-black text-slate-800 tracking-tight mb-2">{notification.title}</h3>
            <p className="text-sm font-medium text-slate-500 mb-5 leading-relaxed">{notification.message}</p>
            {notification.details?.length && (
              <div className="w-full bg-slate-50 rounded-xl p-3.5 mb-5 text-left">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Chi tiết lỗi:</p>
                <ul className="space-y-1">
                  {notification.details.map((d, i) => (
                    <li key={i} className="text-xs text-rose-600 font-bold flex items-start gap-2">
                      <div className="w-1 h-1 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <Button
              onClick={() => setNotification(prev => ({ ...prev, isOpen: false }))}
              className={cn(
                'w-full py-5 rounded-xl font-black uppercase tracking-wider text-white border-none',
                notification.type === 'success'
                  ? 'bg-emerald-500 hover:bg-emerald-600'
                  : 'bg-slate-900 hover:bg-slate-800',
              )}
            >
              Đóng
            </Button>
          </div>
        </div>
      </Modal>

      {/* Confirm delete */}
      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDelete}
        loading={deleteConfirm.isDeleting}
        title="Xóa kế hoạch?"
        message="Bạn có chắc chắn muốn xóa kế hoạch mùa vụ này? Tất cả giai đoạn và công việc liên quan sẽ bị loại bỏ vĩnh viễn."
        confirmLabel="Xóa ngay"
        type="danger"
      />
    </div>
  );
}

export default SeasonPlanPage;