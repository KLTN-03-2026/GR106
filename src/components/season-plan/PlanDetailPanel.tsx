import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Zap,
  ChevronRight,
  Plus,
  Trash2,
  CheckSquare,
  CheckCircle2,
  AlertCircle,
  Layout,
  Link2,
  Copy,
  ExternalLink,
  ChevronDown,
  Flag,
  Calendar,
  Users,
  Package,
  FileText,
  BarChart2,
  Paperclip,
  Edit2,
  Save,
  Loader2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SeasonPlan, Phase, Task, StatusObject } from '@/types/seasonPlan';
import { DateInput } from '@/components/ui/DateInput';
import { cn } from '@/utils/cn';
import { usePlots } from '@/hooks/plots/usePlots';
import { useWarehouseItems } from '@/hooks/warehouseItems/useWarehouseItems';
import { useAuth } from '@/hooks/auth/useAuth';
import { useTaskMaterials } from '@/hooks/taskMaterials/useTaskMaterials';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { toast } from 'sonner';
import { createTaskSchema } from '@/schemas/seasonPlanSchemas';
import { createTaskMaterialSchema } from '@/schemas/taskMaterialSchemas';
import { TaskMaterial } from '@/types/taskMaterial';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PlanDetailPanelProps {
  selection:
  | null
  | { type: 'PLAN'; plan: SeasonPlan }
  | { type: 'PHASE'; plan: SeasonPlan; phase: Phase }
  | { type: 'TASK'; plan: SeasonPlan; phase: Phase; task: Task };
  isOpen: boolean;
  onClose: () => void;
  onUpdatePlan: (plan: SeasonPlan) => void;
  onUpdatePhase: (planId: string, phase: Phase, originalPhase?: Phase) => void;
  onAddTask: (planId: string, phaseId: string, data: { name: string; description: string; startDate: string; endDate: string; plotId: string }) => void;
  onUpdateTask: (planId: string, phaseId: string, task: Task, originalTask?: Task) => void;
  onSelectPhase: (planId: string, phaseId: string) => void;
  onSelectTask: (planId: string, phaseId: string, taskId: string) => void;
  onDeletePlan?: (planId: string) => void;
  onDeletePhase?: (planId: string, phaseId: string) => void;
  onDeleteTask?: (planId: string, phaseId: string, taskId: string) => void;
  onClone?: (plan: SeasonPlan) => void;
  onAddPlots?: (planId: string, plotIds: string[]) => void;
  canEdit?: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function statusCodeOf(s: string | StatusObject | null | undefined): string {
  return typeof s === 'string' ? s : (s?.code ?? '');
}

function fmtDate(d: string) {
  if (!d || d === '—') return '—';
  const parts = d.split('-');
  if (parts.length !== 3) return d;
  const [y, m, day] = parts;
  return `${day}/${m}/${y}`;
}

// Jira-style status chip colours
function statusChipClass(code: string): string {
  switch (code) {
    case 'ACTIVE': case 'IN_PROGRESS': return 'bg-blue-600 text-white';
    case 'READY_TO_HARVEST': return 'bg-lime-600 text-white';
    case 'HARVESTING': return 'bg-emerald-600 text-white';
    case 'COMPLETED': return 'bg-slate-500 text-white';
    case 'CANCELLED': return 'bg-rose-600 text-white';
    case 'OVERDUE': return 'bg-red-600 text-white';
    case 'ASSIGNED': return 'bg-violet-600 text-white';
    case 'DRAFT': default: return 'bg-slate-200 text-slate-700';
  }
}

function statusViLabel(code: string): string {
  switch (code) {
    case 'DRAFT': return 'Bản nháp';
    case 'ACTIVE': return 'Đang thực hiện';
    case 'IN_PROGRESS': return 'Đang thực hiện';
    case 'READY_TO_HARVEST': return 'Sẵn sàng thu hoạch';
    case 'HARVESTING': return 'Đang thu hoạch';
    case 'COMPLETED': return 'Hoàn thành';
    case 'CANCELLED': return 'Đã hủy';
    case 'OVERDUE': return 'Trễ hạn';
    case 'ASSIGNED': return 'Đã giao việc';
    case 'UNASSIGNED': return 'Chưa giao';
    default: return code;
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Jira-style detail row: label on left, value/control on right */
function DetailRow({ icon: Icon, label, children }: {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0 group">
      <div className="flex items-center gap-2 w-[110px] shrink-0">
        <Icon size={14} className="text-slate-400 shrink-0" />
        <span className="text-[11px] text-slate-500 font-medium truncate">{label}</span>
      </div>
      <div className="flex-1 min-w-0 flex items-center">{children}</div>
    </div>
  );
}

/** Inline editable text */
function InlineText({
  value, onChange, placeholder, canEdit, multiline = false,
}: { value: string; onChange: (v: string) => void; placeholder?: string; canEdit: boolean; multiline?: boolean }) {
  if (!canEdit) {
    return (
      <p className={cn('text-[12px] text-slate-700 font-medium break-words', !value && 'text-slate-400 italic')}>
        {value || placeholder}
      </p>
    );
  }
  const cls = 'w-full text-[12px] text-slate-800 font-medium bg-transparent outline-none border border-transparent hover:border-slate-200 focus:border-indigo-400 focus:bg-white rounded px-1.5 py-0.5 transition-all resize-none';
  return multiline
    ? <textarea className={cls} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3} />
    : <input className={cls} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />;
}

function StatusSelect({ value, options, onChange, canEdit }: {
  value: string;
  options: { code: string; label: string }[];
  onChange?: (code: string) => void;
  canEdit: boolean;
}) {
  const [open, setOpen] = useState(false);
  const chip = (
    <button
      disabled={!canEdit}
      onClick={() => canEdit && setOpen(o => !o)}
      className={cn(
        'flex items-center justify-center gap-1.5 h-6 px-2.5 rounded text-[10px] font-bold uppercase tracking-wider whitespace-nowrap',
        statusChipClass(value),
        canEdit && 'cursor-pointer hover:opacity-90',
        !canEdit && 'cursor-default',
      )}
    >
      {statusViLabel(value)}
      {canEdit && <ChevronDown size={10} />}
    </button>
  );

  if (!canEdit) return chip;

  return (
    <div className="relative inline-block">
      {chip}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: .97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: .97 }}
            transition={{ duration: .12 }}
            className="absolute top-8 left-0 z-50 bg-white border border-slate-200 rounded-lg shadow-xl py-1 min-w-[160px]"
          >
            {options.map(opt => (
              <button
                key={opt.code}
                onClick={() => { onChange?.(opt.code); setOpen(false); }}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2 text-left transition-colors',
                  opt.code === value ? 'bg-slate-50' : 'hover:bg-slate-50',
                )}
              >
                <span className={cn(
                  'w-2 h-2 rounded-sm flex-shrink-0',
                  statusChipClass(opt.code).split(' ')[0],
                )} />
                <span className="text-[12px] text-slate-700 font-medium">{opt.label}</span>
                {opt.code === value && <CheckCircle2 size={12} className="text-indigo-500 ml-auto" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      {open && <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function PlanDetailPanel({
  selection,
  isOpen,
  onClose,
  onUpdatePlan,
  onUpdatePhase,
  onAddTask,
  onUpdateTask,
  onSelectPhase,
  onSelectTask,
  onDeletePlan,
  onDeletePhase,
  onDeleteTask,
  onClone,
  onAddPlots,
  canEdit = false,
}: PlanDetailPanelProps) {
  const { currentFarmId } = useAuth();
  const { selectedFarmId } = useSelector((state: RootState) => state.farm);
  const targetFarmId = currentFarmId || selectedFarmId;
  const { plots, fetchPlots, loading } = usePlots();
  const { items: warehouseItems } = useWarehouseItems(targetFarmId);

  const [activeTab, setActiveTab] = useState<'INFO' | 'MEMBERS' | 'MATERIALS'>('INFO');
  const [activeSelection, setActiveSelection] = useState(selection);

  // Use dedicated hook for materials management
  const {
    materials: taskMaterials,
    loading: isMaterialsQueryLoading,
    adding: isAddingMaterial,
    addMaterial
  } = useTaskMaterials(
    activeSelection?.plan.id,
    activeSelection?.type === 'TASK' ? (activeSelection as any).phase.id : undefined,
    activeSelection?.type === 'TASK' ? (activeSelection as any).task.id : undefined,
    isOpen && activeTab === 'MATERIALS' && activeSelection?.type === 'TASK'
  );

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [tempPlan, setTempPlan] = useState<SeasonPlan | null>(null);
  const [tempPhase, setTempPhase] = useState<Phase | null>(null);
  const [tempTask, setTempTask] = useState<Task | null>(null);

  // New task form
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskStart, setNewTaskStart] = useState('');
  const [newTaskEnd, setNewTaskEnd] = useState('');
  const [newTaskPlotId, setNewTaskPlotId] = useState('');

  const [showAddPlot, setShowAddPlot] = useState(false);
  const [selectedPlotIds, setSelectedPlotIds] = useState<string[]>([]);
  const [loadingAddPlot, setLoadingAddPlot] = useState(false);
  const [selectedWarehouseItemId, setSelectedWarehouseItemId] = useState('');
  const [plannedQty, setPlannedQty] = useState<string>('');


  useEffect(() => {


    if (showAddPlot && targetFarmId) {
      fetchPlots(targetFarmId);
    }
  }, [showAddPlot, targetFarmId, fetchPlots]);


  useEffect(() => {
    setActiveSelection(selection);
    setIsEditing(false); // Reset edit mode on selection change
    if (selection) {
      const defaultPlot = selection.plan.plots?.[0]?.plotId ?? '';
      setNewTaskPlotId(defaultPlot);

      // Initialize temp data
      setTempPlan(selection.plan);
      if (selection.type === 'PHASE') setTempPhase(selection.phase);
      if (selection.type === 'TASK') {
        setTempPhase(selection.phase);
        setTempTask(selection.task);
      }
    }
  }, [selection]);

  const handleStartEdit = () => {
    if (!selection) return;
    setTempPlan({ ...selection.plan });
    if (selection.type === 'PHASE') setTempPhase({ ...selection.phase });
    if (selection.type === 'TASK') {
      setTempPhase({ ...selection.phase });
      setTempTask({ ...selection.task });
    }
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset temp data to original
    if (selection) {
      setTempPlan(selection.plan);
      if (selection.type === 'PHASE') setTempPhase(selection.phase);
      if (selection.type === 'TASK') {
        setTempPhase(selection.phase);
        setTempTask(selection.task);
      }
    }
  };

  const handleSaveEdit = async () => {
    if (!selection || !tempPlan) return;

    try {
      if (selection.type === 'PLAN') {
        // Cập nhật Plan (chủ yếu là ngày tháng theo API PUT /time)
        await onUpdatePlan(tempPlan);
      } else if (selection.type === 'PHASE' && tempPhase) {
        // Cập nhật Phase (bao gồm Tên qua API PATCH /stages/{id})
        await onUpdatePhase(tempPlan.id, tempPhase, selection.phase);
      } else if (selection.type === 'TASK' && tempPhase && tempTask) {
        // Cập nhật Task
        await onUpdateTask(tempPlan.id, tempPhase.id, tempTask, selection.task);
      }
      setIsEditing(false);
    } catch (err) {
      console.error('Lỗi khi lưu:', err);
    }
  };

  if (!activeSelection && !isOpen) return null;
  if (!activeSelection) return null;

  const { plan } = activeSelection;
  const sel = activeSelection;

  // ── Status options ──
  const phaseStatusOptions = [
    { code: 'DRAFT', label: 'Bản nháp' },
    { code: 'ACTIVE', label: 'Đang thực hiện' },
    { code: 'READY_TO_HARVEST', label: 'Sẵn sàng thu hoạch' },
    { code: 'HARVESTING', label: 'Đang thu hoạch' },
    { code: 'COMPLETED', label: 'Hoàn thành' },
    { code: 'CANCELLED', label: 'Đã hủy' },
  ];
  const taskStatusOptions = [
    { code: 'UNASSIGNED', label: 'Chưa giao' },
    { code: 'ASSIGNED', label: 'Đã giao việc' },
    { code: 'IN_PROGRESS', label: 'Đang thực hiện' },
    { code: 'COMPLETED', label: 'Hoàn thành' },
    { code: 'OVERDUE', label: 'Trễ hạn' },
    { code: 'CANCELLED', label: 'Đã hủy' },
  ];


  const handleAddPlots = async () => {
    if (!plan.id || selectedPlotIds.length === 0) return;

    try {
      setLoadingAddPlot(true);
      if (onAddPlots) {
        await onAddPlots(plan.id, selectedPlotIds);
      }
      setShowAddPlot(false);
      setSelectedPlotIds([]);
    } catch (err) {
      console.error('Lỗi khi thêm lô đất:', err);
    } finally {
      setLoadingAddPlot(false);
    }
  };

  // ── Delete ──
  const handleDelete = () => {
    setShowDeleteConfirm(false);
    if (sel.type === 'PLAN') {
      const code = statusCodeOf(plan.status);
      if (['ACTIVE', 'READY_TO_HARVEST', 'HARVESTING'].includes(code)) {
        onUpdatePlan({ ...plan, status: 'CANCELLED' });
      } else {
        onDeletePlan?.(plan.id);
      }
      onClose();
    } else if (sel.type === 'PHASE') {
      onDeletePhase?.(plan.id, sel.phase.id);
      onClose();
    } else if (sel.type === 'TASK') {
      onDeleteTask?.(plan.id, sel.phase.id, sel.task.id);
    }
  };

  // ── Add task ──
  const handleAddTaskSubmit = () => {
    if (sel.type !== 'PHASE') return;

    const payload = {
      name: newTaskName,
      description: newTaskDesc,
      startDate: newTaskStart || sel.phase.startDate,
      endDate: newTaskEnd || sel.phase.endDate,
      plotId: newTaskPlotId,
    };

    const validation = createTaskSchema.safeParse(payload);
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    onAddTask(plan.id, sel.phase.id, validation.data as any);

    setNewTaskName(''); setNewTaskDesc('');
    setNewTaskStart(''); setNewTaskEnd('');
    setIsAddingTask(false);
  };

  const handleAddMaterial = async () => {
    if (!activeSelection || activeSelection.type !== 'TASK') return;

    const payload = {
      warehouseItemId: selectedWarehouseItemId,
      plannedQty,
    };
    const validation = createTaskMaterialSchema.safeParse(payload);
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    // const isDuplicateWarehouseItem = (taskMaterials ?? []).some(
    //   (material) => material.warehouseItem.id === validation.data.warehouseItemId,
    // );
    // if (isDuplicateWarehouseItem) {
    //   toast.error('Vật tư này đã tồn tại trong công việc');
    //   return;
    // }

    try {
      await addMaterial(validation.data);
      setSelectedWarehouseItemId('');
      setPlannedQty('');
      toast.success('Thêm vật tư thành công');
    } catch (error) {
      console.error('Lỗi thêm vật tư:', error);
      toast.error('Không thể thêm vật tư');
    }
  };

  // ── Type label & icon ──
  const typeIcon =
    sel.type === 'PLAN' ? <Layout size={14} className="text-indigo-500" /> :
      sel.type === 'PHASE' ? <Zap size={14} className="text-violet-500 fill-violet-500" /> :
        <CheckSquare size={14} className="text-blue-500" />;

  const typeLabel =
    sel.type === 'PLAN' ? 'Kế hoạch' : sel.type === 'PHASE' ? 'Giai đoạn' : 'Công việc';


  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 360, damping: 36 }}
          className="w-[340px] flex-shrink-0 bg-white border-l border-slate-200 flex flex-col z-40 shadow-xl overflow-hidden"
        >
          {/* ── Top bar (Jira issue header) ── */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-200 bg-slate-50 flex-shrink-0">
            {/* Breadcrumb */}
            <div className="flex items-center gap-1 flex-1 min-w-0 text-[11px] text-slate-500 font-medium">
              {typeIcon}
              <span className="text-slate-400">{typeLabel}</span>
              {sel.type !== 'PLAN' && (
                <>
                  <ChevronRight size={11} className="text-slate-300 shrink-0" />
                  <button
                    className="hover:text-indigo-600 truncate max-w-[80px] transition-colors"
                    onClick={() => onSelectPhase(plan.id, sel.type === 'PHASE' ? sel.phase.id : sel.phase.id)}
                  >
                    {sel.type === 'PHASE' ? sel.phase.name : sel.phase.name}
                  </button>
                </>
              )}
              {sel.type === 'TASK' && (
                <>
                  <ChevronRight size={11} className="text-slate-300 shrink-0" />
                  <span className="text-slate-700 truncate max-w-[80px]">{sel.task.name}</span>
                </>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-0.5 flex-shrink-0">
              {canEdit && !isEditing && (
                <button
                  className="p-1.5 text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50 rounded transition-colors"
                  onClick={handleStartEdit}
                  title="Chỉnh sửa"
                >
                  <Edit2 size={13} />
                </button>
              )}
              {isEditing && (
                <>
                  <button
                    className="p-1.5 text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 rounded transition-colors"
                    onClick={handleSaveEdit}
                    title="Lưu"
                  >
                    <Save size={13} />
                  </button>
                  <button
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded transition-colors"
                    onClick={handleCancelEdit}
                    title="Hủy"
                  >
                    <X size={13} />
                  </button>
                </>
              )}
              {!isEditing && (
                <>
                  <button className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded transition-colors" title="Sao chép link">
                    <Link2 size={13} />
                  </button>
                  <button className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded transition-colors" title="Mở rộng">
                    <ExternalLink size={13} />
                  </button>
                  {canEdit && sel.type !== 'PLAN' && (
                    <button
                      className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                      onClick={() => setShowDeleteConfirm(true)}
                      title="Xóa"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                  <button
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded transition-colors"
                    onClick={onClose}
                  >
                    <X size={13} />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* ── Scrollable body ── */}
          <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>

            {/* Title section */}
            <div className="px-4 pt-4 pb-3 border-b border-slate-100">
              <div className="flex items-start gap-2">
                <div className="flex-1 min-w-0">
                  <InlineText
                    canEdit={isEditing}
                    value={
                      sel.type === 'PLAN' ? tempPlan?.name ?? '' :
                        sel.type === 'PHASE' ? tempPhase?.name ?? '' :
                          tempTask?.name ?? ''
                    }
                    onChange={v => {
                      if (sel.type === 'PLAN' && tempPlan) setTempPlan({ ...tempPlan, name: v });
                      if (sel.type === 'PHASE' && tempPhase) setTempPhase({ ...tempPhase, name: v });
                      if (sel.type === 'TASK' && tempTask) setTempTask({ ...tempTask, name: v });
                    }}
                  />
                </div>
              </div>

              {/* Status lozenge + quick actions */}
              <div className="flex items-center gap-2 mt-2.5">
                {sel.type === 'PLAN' && (
                  <StatusSelect
                    value={statusCodeOf(plan.status)}
                    options={phaseStatusOptions}
                    canEdit={false}
                  />
                )}
                {sel.type === 'PHASE' && (
                  <StatusSelect
                    value={statusCodeOf(tempPhase?.status ?? sel.phase.status)}
                    options={phaseStatusOptions}
                    onChange={s => tempPhase && setTempPhase({ ...tempPhase, status: { ...tempPhase.status, code: s } })}
                    canEdit={isEditing}
                  />
                )}
                {sel.type === 'TASK' && (
                  <StatusSelect
                    value={statusCodeOf(tempTask?.status ?? sel.task.status)}
                    options={taskStatusOptions}
                    onChange={s => tempTask && setTempTask({ ...tempTask, status: { ...tempTask.status, code: s } })}
                    canEdit={isEditing}
                  />
                )}

                {/* Pin / Clone quick actions for PLAN */}
                {sel.type === 'PLAN' && canEdit && (
                  <button
                    className="flex items-center gap-1 h-6 px-2 text-[10px] font-semibold text-slate-500 border border-slate-200 rounded hover:border-indigo-300 hover:text-indigo-600 transition-colors"
                    onClick={() => onClone?.(plan)}
                  >
                    <Copy size={10} /> Nhân bản
                  </button>
                )}
              </div>
            </div>

            {/* ── Detail fields (Jira right-rail style) ── */}
            <div className="px-4 py-1">

              {/* PLAN fields */}
              {sel.type === 'PLAN' && (
                <>
                  <DetailRow icon={Calendar} label="Ngày bắt đầu">
                    <div className="flex-1">
                      {isEditing ? (
                        <DateInput value={tempPlan?.startDate ?? ''}
                          onChange={(v: string) => tempPlan && setTempPlan({ ...tempPlan, startDate: v })} />
                      ) : <span className="text-[12px] text-slate-700 font-bold tabular-nums">{fmtDate(tempPlan?.startDate ?? plan.startDate)}</span>}
                    </div>
                  </DetailRow>
                  <DetailRow icon={Calendar} label="Ngày kết thúc">
                    <div className="flex-1">
                      {isEditing ? (
                        <DateInput value={tempPlan?.endDate ?? ''}
                          onChange={(v: string) => tempPlan && setTempPlan({ ...tempPlan, endDate: v })} />
                      ) : <span className="text-[12px] text-slate-700 font-bold tabular-nums">{fmtDate(tempPlan?.endDate ?? plan.endDate)}</span>}
                    </div>
                  </DetailRow>
                  <DetailRow icon={Package} label="Lô đất">
                    {(tempPlan?.plots ?? plan.plots ?? []).length > 0
                      ? <div className="flex flex-wrap gap-1">
                        {(tempPlan?.plots ?? plan.plots ?? []).map(pp => (
                          <span key={pp.plotId} className="inline-flex items-center gap-1 text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                            {pp.plotName}
                          </span>
                        ))}
                      </div>
                      : <span className="text-[12px] text-slate-400 italic">Chưa gán lô đất</span>
                    }
                  </DetailRow>
                  <DetailRow icon={Zap} label="Số giai đoạn">
                    <span className="text-[12px] text-slate-700 font-medium">{(tempPlan?.phases ?? plan.phases)?.length ?? 0} giai đoạn</span>
                  </DetailRow>
                </>
              )}

              {/* PHASE fields */}
              {sel.type === 'PHASE' && (
                <>
                  <DetailRow icon={Calendar} label="Ngày bắt đầu">
                    <div className="flex-1">
                      {isEditing ? (
                        <DateInput value={tempPhase?.startDate ?? ''}
                          onChange={(v: string) => tempPhase && setTempPhase({ ...tempPhase, startDate: v })} />
                      ) : <span className="text-[12px] text-slate-700 font-bold tabular-nums">{fmtDate(tempPhase?.startDate ?? sel.phase.startDate)}</span>}
                    </div>
                  </DetailRow>
                  <DetailRow icon={Calendar} label="Ngày kết thúc">
                    <div className="flex-1">
                      {isEditing ? (
                        <DateInput value={tempPhase?.endDate ?? ''}
                          onChange={(v: string) => tempPhase && setTempPhase({ ...tempPhase, endDate: v })} />
                      ) : <span className="text-[12px] text-slate-700 font-bold tabular-nums">{fmtDate(tempPhase?.endDate ?? sel.phase.endDate)}</span>}
                    </div>
                  </DetailRow>
                  <DetailRow icon={CheckSquare} label="Công việc">
                    <span className="text-[12px] text-slate-700 font-medium">{(tempPhase?.tasks ?? sel.phase.tasks)?.length ?? 0} công việc</span>
                  </DetailRow>
                  <DetailRow icon={Flag} label="Kế hoạch">
                    <span className="text-[12px] font-medium text-indigo-600">{plan.name}</span>
                  </DetailRow>
                </>
              )}

              {/* TASK fields */}
              {sel.type === 'TASK' && (
                <>
                  <DetailRow icon={Calendar} label="Ngày bắt đầu">
                    <div className="flex-1">
                      {isEditing ? (
                        <DateInput value={tempTask?.startDate ?? ''}
                          onChange={(v: string) => tempTask && setTempTask({ ...tempTask, startDate: v })} />
                      ) : <span className="text-[12px] text-slate-700 font-bold tabular-nums">{fmtDate(tempTask?.startDate ?? sel.task.startDate)}</span>}
                    </div>
                  </DetailRow>
                  <DetailRow icon={Calendar} label="Ngày kết thúc">
                    <div className="flex-1">
                      {isEditing ? (
                        <DateInput value={tempTask?.endDate ?? ''}
                          onChange={(v: string) => tempTask && setTempTask({ ...tempTask, endDate: v })} />
                      ) : <span className="text-[12px] text-slate-700 font-bold tabular-nums">{fmtDate(tempTask?.endDate ?? sel.task.endDate)}</span>}
                    </div>
                  </DetailRow>
                  <DetailRow icon={Zap} label="Giai đoạn">
                    <button
                      className="text-[12px] font-medium text-violet-600 hover:underline"
                      onClick={() => onSelectPhase(plan.id, sel.phase.id)}
                    >
                      {sel.phase.name}
                    </button>
                  </DetailRow>
                  <DetailRow icon={Flag} label="Kế hoạch">
                    <span className="text-[12px] font-medium text-indigo-600">{plan.name}</span>
                  </DetailRow>
                  <DetailRow icon={Package} label="Lô đất">
                    {isEditing ? (
                      <select
                        value={tempTask?.plotId ?? ''}
                        onChange={e => tempTask && setTempTask({ ...tempTask, plotId: e.target.value })}
                        className="text-[12px] font-medium text-slate-700 bg-transparent outline-none border-b border-slate-300 focus:border-indigo-400 transition-colors w-full px-1"
                      >
                        <option value="">Chọn lô đất...</option>
                        {plan.plots?.map(p => (
                          <option key={p.plotId} value={p.plotId}>{p.plotName}</option>
                        ))}
                      </select>
                    ) : (
                      plan.plots && plan.plots.length > 0
                        ? <span className="text-[12px] font-medium text-emerald-700">{plan.plots.find(p => p.plotId === (tempTask?.plotId ?? sel.task.plotId))?.plotName || plan.plots[0].plotName}</span>
                        : <span className="text-[12px] text-slate-400 italic">—</span>
                    )}
                  </DetailRow>
                </>
              )}
            </div>


            {/* ── Description ── */}
            <div className="px-4 py-3 border-t border-slate-100">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <FileText size={11} /> Mô tả
              </p>
              <InlineText
                multiline
                canEdit={isEditing && sel.type !== 'PLAN'}
                placeholder="Thêm mô tả..."
                value={
                  sel.type === 'PLAN' ? (plan.description ?? '') :
                    sel.type === 'PHASE' ? (tempPhase?.description ?? sel.phase.description ?? '') :
                      (tempTask?.description ?? sel.task.description ?? '')
                }
                onChange={v => {
                  if (sel.type === 'PHASE' && tempPhase) setTempPhase({ ...tempPhase, description: v });
                  if (sel.type === 'TASK' && tempTask) setTempTask({ ...tempTask, description: v });
                }}
              />
            </div>

            {/* ── TASK progress ── */}
            {sel.type === 'TASK' && (
              <div className="px-4 py-3 border-t border-slate-100">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <BarChart2 size={11} /> Tiến độ
                </p>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-indigo-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${sel.task.progressPercent ?? 0}%` }}
                      transition={{ duration: .4, ease: 'easeOut' }}
                    />
                  </div>
                  <span className="text-[11px] font-bold text-slate-600 w-8 text-right tabular-nums">
                    {sel.task.progressPercent ?? 0}%
                  </span>
                </div>
                {canEdit && (
                  <input
                    type="range" min="0" max="100"
                    value={sel.task.progressPercent ?? 0}
                    onChange={e => onUpdateTask(plan.id, sel.phase.id, { ...sel.task, progressPercent: +e.target.value })}
                    disabled={['COMPLETED', 'CANCELLED'].includes(statusCodeOf(sel.task.status))}
                    className="w-full accent-indigo-600 disabled:opacity-40"
                  />
                )}
              </div>
            )}

            {/* ── PHASE: task list ── */}
            {sel.type === 'PHASE' && (
              <div className="px-4 py-3 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckSquare size={11} /> Công việc con
                    <span className="ml-1 text-[10px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">
                      {sel.phase.tasks?.length ?? 0}
                    </span>
                  </p>
                  {canEdit && (
                    <button
                      onClick={() => {
                        setIsAddingTask(true);
                        setNewTaskStart(sel.phase.startDate);
                        setNewTaskEnd(sel.phase.endDate);
                        if (plan.plots?.length) {
                          setNewTaskPlotId(plan.plots[0].plotId);
                        }
                      }}
                      className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded transition-colors"
                    >
                      <Plus size={11} /> Thêm
                    </button>
                  )}
                </div>

                {/* Task rows */}
                <div className="space-y-0.5">
                  {sel.phase.tasks?.map(task => {
                    const code = statusCodeOf(task.status);
                    return (
                      <button
                        key={task.id}
                        onClick={() => onSelectTask(plan.id, sel.phase.id, task.id)}
                        className="w-full flex items-center gap-2.5 px-2 py-2 rounded-md hover:bg-slate-50 transition-colors group text-left"
                      >
                        {/* checkbox icon */}
                        <div className={cn(
                          'w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0 transition-colors',
                          code === 'COMPLETED' ? 'bg-indigo-500 border-indigo-500' : 'border-slate-300 group-hover:border-indigo-300',
                        )}>
                          {code === 'COMPLETED' && (
                            <svg width="8" height="8" viewBox="0 0 8 8">
                              <path d="M1 4l2 2 4-3" stroke="#fff" strokeWidth="1.3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </div>
                        <span className={cn(
                          'flex-1 text-[12px] font-medium truncate',
                          code === 'COMPLETED' ? 'text-slate-400 line-through' : 'text-slate-700 group-hover:text-indigo-600',
                        )}>
                          {task.name}
                        </span>
                        <span className={cn(
                          'text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide flex-shrink-0',
                          statusChipClass(code),
                        )}>
                          {statusViLabel(code)}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Add task inline form */}
                <AnimatePresence>
                  {isAddingTask && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-2 p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2.5">
                        <input
                          autoFocus
                          placeholder="Tên công việc..."
                          value={newTaskName}
                          onChange={e => setNewTaskName(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleAddTaskSubmit()}
                          className="w-full px-2.5 py-1.5 text-[12px] font-medium bg-white border border-slate-200 rounded-md outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100 transition-all"
                        />
                        <textarea
                          placeholder="Mô tả (tùy chọn)..."
                          value={newTaskDesc}
                          onChange={e => setNewTaskDesc(e.target.value)}
                          rows={2}
                          className="w-full px-2.5 py-1.5 text-[12px] text-slate-600 bg-white border border-slate-200 rounded-md outline-none focus:border-indigo-400 transition-all resize-none"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <DateInput
                            label="Bắt đầu"
                            value={newTaskStart}
                            onChange={setNewTaskStart}
                            className="space-y-1"
                          />
                          <DateInput
                            label="Kết thúc"
                            value={newTaskEnd}
                            onChange={setNewTaskEnd}
                            className="space-y-1"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wide ml-0.5">Lô đất</label>
                          <select
                            value={newTaskPlotId}
                            onChange={e => setNewTaskPlotId(e.target.value)}
                            className="w-full mt-0.5 px-2 py-1.5 text-[12px] font-medium bg-white border border-slate-200 rounded-md outline-none focus:border-indigo-400 transition-all"
                          >
                            <option value="">Chọn lô đất...</option>
                            {plan.plots?.map(p => (
                              <option key={p.plotId} value={p.plotId}>{p.plotName}</option>
                            ))}
                          </select>
                        </div>
                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={() => setIsAddingTask(false)}
                            className="flex-1 py-1.5 text-[11px] font-bold text-slate-500 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors"
                          >
                            Hủy
                          </button>
                          <button
                            onClick={handleAddTaskSubmit}
                            disabled={!newTaskName.trim()}
                            className="flex-1 py-1.5 text-[11px] font-bold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-40 transition-colors"
                          >
                            Lưu
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* ── TASK: tabs (Info / Members / Materials) ── */}
            {sel.type === 'TASK' && (
              <div className="border-t border-slate-100">
                {/* Tab bar */}
                <div className="flex border-b border-slate-100 px-4">
                  {(['INFO', 'MEMBERS', 'MATERIALS'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={cn(
                        'px-3 py-2.5 text-[11px] font-semibold border-b-2 transition-all',
                        activeTab === tab
                          ? 'border-indigo-600 text-indigo-600'
                          : 'border-transparent text-slate-500 hover:text-slate-800',
                      )}
                    >
                      {tab === 'INFO' ? 'Thông tin' : tab === 'MEMBERS' ? 'Nhân sự' : 'Vật tư'}
                    </button>
                  ))}
                </div>

                <div className="px-4 py-3">
                  {/* INFO tab — progress attachment */}
                  {activeTab === 'INFO' && (
                    <div className="space-y-3">
                      {/* Attachment placeholder */}
                      <div className="flex items-center gap-2 p-3 border-2 border-dashed border-slate-200 rounded-lg cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/30 transition-colors group">
                        <Paperclip size={14} className="text-slate-400 group-hover:text-indigo-500" />
                        <span className="text-[11px] font-medium text-slate-500 group-hover:text-indigo-600">
                          Tải lên minh chứng hoàn thành...
                        </span>
                      </div>
                    </div>
                  )}

                  {/* MEMBERS tab */}
                  {activeTab === 'MEMBERS' && (
                    <div className="space-y-3">
                      <div className="py-8 flex flex-col items-center justify-center bg-slate-50 rounded-lg border border-dashed border-slate-200">
                        <Users size={22} className="text-slate-300 mb-2" />
                        <p className="text-[11px] font-bold text-slate-400">Tính năng đang phát triển</p>
                      </div>
                      <div className="flex gap-2 p-2.5 bg-amber-50 border border-amber-100 rounded-lg">
                        <AlertCircle size={13} className="text-amber-500 shrink-0 mt-0.5" />
                        <p className="text-[11px] text-amber-800 leading-relaxed">
                          Phân công nhân sự sẽ ra mắt khi module quản lý nhân sự hoàn tất.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* MATERIALS tab */}
                  {activeTab === 'MATERIALS' && (
                    <div className="space-y-2">
                      {isMaterialsQueryLoading ? (
                        <div className="py-4 flex justify-center">
                          <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
                        </div>
                      ) : taskMaterials?.length ? (
                        taskMaterials.map((mat: TaskMaterial) => (
                          <div key={mat.id} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                            <div className="flex items-center gap-2">
                              <Package size={13} className="text-slate-400" />
                              <span className="text-[12px] font-medium text-slate-700">{mat.warehouseItem.name}</span>
                            </div>
                            <span className="text-[11px] font-bold text-indigo-600">
                              {mat.plannedQty} {mat.warehouseItem.unit?.name ?? 'đơn vị'}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="py-8 flex flex-col items-center bg-slate-50 rounded-lg border border-dashed border-slate-200">
                          <Package size={22} className="text-slate-300 mb-2" />
                          <p className="text-[11px] font-bold text-slate-400">Chưa có vật tư</p>
                        </div>
                      )}
                      {canEdit && (
                        <div className="p-2.5 bg-white border border-slate-200 rounded-lg space-y-2 mt-2">
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Thêm vật tư cho công việc</p>
                          <div className="relative">
                            <select
                              value={selectedWarehouseItemId}
                              onChange={(e) => setSelectedWarehouseItemId(e.target.value)}
                              className="w-full px-2 py-1.5 text-[12px] bg-slate-50 border border-slate-200 rounded-md outline-none focus:border-indigo-400 appearance-none pr-6"
                            >
                              <option value="">Chọn vật tư kho...</option>
                              {warehouseItems.map((item) => (
                                <option key={item.id} value={item.id}>
                                  {item.name} — Tồn: {item.stock != null ? item.stock.toLocaleString('vi-VN') : '0'}
                                </option>
                              ))}
                            </select>
                            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                          </div>

                          {/* Badge tồn kho cho item đang chọn */}
                          {selectedWarehouseItemId && (() => {
                            const selected = warehouseItems.find(i => i.id === selectedWarehouseItemId);
                            if (!selected) return null;
                            const stock = selected.stock ?? 0;
                            const isLow = stock <= (selected.minStockQty ?? 0);
                            return (
                              <div className={`flex items-center justify-between px-2.5 py-1.5 rounded-md border text-[11px] font-medium ${isLow ? 'bg-rose-50 border-rose-100 text-rose-700' : 'bg-emerald-50 border-emerald-100 text-emerald-700'
                                }`}>
                                <span className="truncate">{selected.name}</span>
                                <span className="font-bold ml-2 shrink-0">
                                  Tồn: {stock.toLocaleString('vi-VN')}
                                </span>
                              </div>
                            );
                          })()}
                          <input
                            type="text"
                            value={plannedQty}
                            onChange={(e) => {
                              const value = e.target.value;

                              // Cho nhập số + dấu chấm
                              if (/^\d*\.?\d*$/.test(value)) {
                                setPlannedQty(value);
                              }
                            }}
                            placeholder="Nhập số lượng"
                            className="w-full px-2 py-1.5 text-[12px] bg-slate-50 border border-slate-200 rounded-md outline-none focus:border-indigo-400"
                          />

                          <button
                            onClick={handleAddMaterial}
                            disabled={isAddingMaterial}
                            className="w-full py-1.5 text-[12px] bg-indigo-600 text-white rounded-md disabled:opacity-40"
                          >
                            {isAddingMaterial ? 'Đang thêm...' : 'Thêm vật tư'}
                          </button>
                        </div>
                      )}
                      <div className="flex gap-2 p-2.5 bg-indigo-50 border border-indigo-100 rounded-lg mt-2">
                        <CheckCircle2 size={13} className="text-indigo-500 shrink-0 mt-0.5" />
                        <p className="text-[11px] text-indigo-800 leading-relaxed">
                          Tự động trừ tồn kho khi xuất vật tư từ kho.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── PLAN: plot management ── */}
            {sel.type === 'PLAN' && canEdit && (
              <div className="px-4 py-3 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Package size={11} /> Lô đất canh tác
                  </p>
                  <button
                    onClick={() => setShowAddPlot(true)}
                    className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded transition-colors"
                  >
                    <Plus size={11} /> Thêm lô
                  </button>
                </div>
                <div className="space-y-1.5">
                  {plan.plots?.length ? plan.plots.map(pp => (
                    <div key={pp.plotId} className="flex items-center justify-between px-2.5 py-2 bg-slate-50 rounded-lg border border-slate-100 group">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span className="text-[12px] font-medium text-slate-700">{pp.plotName}</span>
                      </div>
                      <button className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 transition-all">
                        <Trash2 size={11} />
                      </button>
                    </div>
                  )) : (
                    <div className="py-4 text-center border-2 border-dashed border-slate-200 rounded-lg">
                      <p className="text-[11px] text-slate-400">Chưa gán lô đất nào</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            <AnimatePresence>
              {showAddPlot && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40">
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-white rounded-xl p-4 w-[320px] shadow-xl"
                  >
                    <h3 className="text-[14px] font-bold mb-3">Thêm lô đất</h3>

                    <div className="max-h-[200px] overflow-y-auto space-y-1">
                      {plots.length === 0 && !loading ? (
                        <div className="py-4 text-center">
                          <p className="text-[12px] text-slate-400 font-medium">Không tìm thấy lô đất nào</p>
                        </div>
                      ) : plots.map(p => {
                        const checked = selectedPlotIds.includes(p.id);

                        return (
                          <label
                            key={p.id}
                            className="flex items-center gap-2 p-2 rounded hover:bg-slate-50 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => {
                                setSelectedPlotIds((prev: string[]) =>
                                  checked
                                    ? prev.filter((id: string) => id !== p.id)
                                    : [...prev, p.id]
                                );
                              }}
                            />
                            <span className="text-[12px]">{p.name}</span>
                          </label>
                        );
                      })}
                      {loading && (
                        <div className="py-4 flex justify-center">
                          <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => setShowAddPlot(false)}
                        className="flex-1 py-1.5 text-[12px] bg-slate-100 rounded"
                      >
                        Hủy
                      </button>

                      <button
                        onClick={handleAddPlots}
                        disabled={loadingAddPlot || selectedPlotIds.length === 0}
                        className="flex-1 py-1.5 text-[12px] bg-indigo-600 text-white rounded disabled:opacity-40"
                      >
                        {loadingAddPlot ? 'Đang thêm...' : 'Thêm'}
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* Bottom padding */}
            <div className="h-6" />
          </div>

          {/* ── Delete confirm modal ── */}
          {createPortal(
            <AnimatePresence>
              {showDeleteConfirm && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                  <motion.div
                    initial={{ opacity: 0, scale: .96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: .96 }}
                    className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-100"
                  >
                    <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center text-rose-500 mb-4">
                      <Trash2 size={22} />
                    </div>
                    <h3 className="text-[15px] font-bold text-slate-900 mb-1.5">
                      {sel.type === 'PHASE' ? 'Xóa giai đoạn?' : 'Xóa công việc?'}
                    </h3>
                    <p className="text-[12px] text-slate-500 mb-5 leading-relaxed">
                      {sel.type === 'PHASE'
                        ? 'Tất cả công việc trong giai đoạn này cũng sẽ bị xóa. Hành động không thể hoàn tác.'
                        : 'Dữ liệu công việc sẽ bị xóa vĩnh viễn.'}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="flex-1 py-2 text-[12px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                      >
                        Hủy
                      </button>
                      <button
                        onClick={handleDelete}
                        className="flex-1 py-2 text-[12px] font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors"
                      >
                        Xóa
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>,
            document.body,
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}