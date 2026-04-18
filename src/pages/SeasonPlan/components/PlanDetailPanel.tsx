import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Zap,
  ChevronRight,
  Plus,
  Trash2,
  CheckSquare,
  Layout,
  Clock,
  Users,
  Package,
  Activity,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SeasonPlan, PlanStatus, Phase, Task, StatusObject } from '../../../types/seasonPlan';
import { Plot } from '../../../types/plot/plot';
import { cn } from '../../../utils/cn';
import { Button } from '../../../components/ui/button';

interface PlanDetailPanelProps {
  selection: null |
  { type: 'PLAN'; plan: SeasonPlan } |
  { type: 'PHASE'; plan: SeasonPlan; phase: Phase } |
  { type: 'TASK'; plan: SeasonPlan; phase: Phase; task: Task };
  isOpen: boolean;
  onClose: () => void;
  onUpdatePlan: (plan: SeasonPlan) => void;
  onUpdatePhase: (planId: string, phase: Phase) => void;
  onAddTask: (planId: string, phaseId: string, data: { name: string; description: string; startDate: string; endDate: string; plotId: string }) => void;
  onUpdateTask: (planId: string, phaseId: string, task: Task) => void;
  onSelectPhase: (planId: string, phaseId: string) => void;
  onSelectTask: (planId: string, phaseId: string, taskId: string) => void;
  plots: Plot[];
  onDeletePlan?: (planId: string) => void;
  onDeletePhase?: (planId: string, phaseId: string) => void;
  onDeleteTask?: (planId: string, phaseId: string, taskId: string) => void;
  onClone?: (plan: SeasonPlan) => void;
  canEdit?: boolean;
}

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
  plots,
  onDeletePlan,
  onDeletePhase,
  onDeleteTask,
  onClone,
  canEdit = false,
}: PlanDetailPanelProps) {
  const canDelete = canEdit;
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [activeSelection, setActiveSelection] = useState(selection);
  const [activeTab, setActiveTab] = useState<'INFO' | 'MEMBERS' | 'MATERIALS'>('INFO');

  // New task form state
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskStart, setNewTaskStart] = useState('');
  const [newTaskEnd, setNewTaskEnd] = useState('');
  const [newTaskPlotId, setNewTaskPlotId] = useState('');

  useEffect(() => {
    if (selection) {
      setActiveSelection(selection);
      setNewTaskPlotId(selection.plan.plotId || '');
    }
  }, [selection]);

  // If no selection and not open, we can safely return null
  // But during exit animation, selection might be null but isOpen transition is still happening
  if (!activeSelection && !isOpen) return null;

  const plan = activeSelection?.plan;
  const currentSelection = activeSelection;

  if (!currentSelection || !plan) return null;

  const handleDelete = () => {
    setShowDeleteConfirm(false);
    if (currentSelection.type === 'PLAN') {
      const statusCode = typeof plan.status === 'string' ? plan.status : plan.status.code;
      const isOngoing = ['ACTIVE', 'READY_TO_HARVEST', 'HARVESTING'].includes(statusCode);
      if (isOngoing) {
        const updatedPhases = plan.phases.map((p: Phase) => {
          const pStatusCode = typeof p.status === 'string' ? p.status : p.status.code;
          if (pStatusCode === 'DRAFT') {
            return {
              ...p,
              status: { ...p.status, code: 'CANCELLED' as PlanStatus },
              tasks: p.tasks.map(t => ({
                ...t,
                status: { ...t.status, code: 'CANCELLED' as PlanStatus }
              }))
            };
          }
          return p;
        });
        onUpdatePlan({ ...plan, status: 'CANCELLED', phases: updatedPhases });
      } else if (onDeletePlan) {
        onDeletePlan(plan.id);
      }
      onClose();
    } else if (currentSelection.type === 'PHASE') {
      if (onDeletePhase) {
        onDeletePhase(plan.id, currentSelection.phase.id);
        onClose();
      }
    } else if (currentSelection.type === 'TASK') {
      if (onDeleteTask) {
        onDeleteTask(plan.id, currentSelection.phase.id, currentSelection.task.id);
        onClose();
      }
    }
  };

  const handleAddTaskSubmit = () => {
    if (currentSelection.type === 'PHASE' && newTaskName.trim()) {
      onAddTask(plan.id, currentSelection.phase.id, {
        name: newTaskName.trim(),
        description: newTaskDesc.trim(),
        startDate: newTaskStart || new Date().toISOString().split('T')[0],
        endDate: newTaskEnd || new Date().toISOString().split('T')[0],
        plotId: newTaskPlotId
      });
      
      // Reset form
      setNewTaskName('');
      setNewTaskDesc('');
      setNewTaskStart('');
      setNewTaskEnd('');
      setIsAddingTask(false);
    } else {
      console.warn('[PlanDetailPanel] Cannot add task: invalid state or name', { type: currentSelection.type, name: newTaskName });
    }
  };

  const renderBreadcrumbs = () => {
    return (
      <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 mb-4 px-1">
        <span className="hover:text-slate-900 cursor-pointer transition-colors truncate max-w-[100px]">{plan.name}</span>
        {currentSelection.type !== 'PLAN' && (
          <>
            <ChevronRight size={12} className="shrink-0" />
            <span
              className={cn(
                "hover:text-slate-900 cursor-pointer transition-colors truncate max-w-[100px]",
                currentSelection.type === 'PHASE' && "text-slate-900"
              )}
              onClick={() => onSelectPhase(plan.id, currentSelection.type === 'PHASE' ? currentSelection.phase.id : currentSelection.phase.id)}
            >
              {currentSelection.type === 'PHASE' ? currentSelection.phase.name : currentSelection.phase.name}
            </span>
          </>
        )}
        {currentSelection.type === 'TASK' && (
          <>
            <ChevronRight size={12} className="shrink-0" />
            <span className="text-slate-900 truncate max-w-[100px]">{currentSelection.task.name}</span>
          </>
        )}
      </div>
    );
  };

  const renderStatusDropdown = (currentStatus: any, onStatusChange: (s: any) => void) => {
    const statusCode = typeof currentStatus === 'string' ? currentStatus : (currentStatus as StatusObject).code;
    const statusName = typeof currentStatus === 'string' ? currentStatus : (currentStatus as StatusObject).name;
    const statusColor = typeof currentStatus === 'string' ? '' : (currentStatus as StatusObject).color;

    const getColorClass = (code: string) => {
      switch (code) {
        case 'ACTIVE':
        case 'IN_PROGRESS': return "bg-indigo-600 text-white";
        case 'READY_TO_HARVEST':
        case 'HARVESTING': return "bg-lime-600 text-white";
        case 'COMPLETED': return "bg-emerald-600 text-white";
        case 'CANCELLED': return "bg-rose-600 text-white";
        case 'OVERDUE': return "bg-red-600 text-white";
        case 'ASSIGNED': return "bg-blue-600 text-white";
        default: return "bg-slate-200 text-slate-700";
      }
    };

    if (!canEdit) {
      return (
        <div 
          className="h-8 px-3 rounded flex items-center font-black text-[10px] uppercase tracking-widest shadow-sm text-white"
          style={{ backgroundColor: statusColor || '#64748b' }}
        >
          {statusName}
        </div>
      );
    }

    const statuses = currentSelection?.type === 'TASK'
      ? [
        { code: 'UNASSIGNED', label: 'Chưa giao việc' },
        { code: 'ASSIGNED', label: 'Đã giao việc' },
        { code: 'IN_PROGRESS', label: 'Đang thực hiện' },
        { code: 'COMPLETED', label: 'Hoàn thành' },
        { code: 'OVERDUE', label: 'Trễ hạn' },
        { code: 'CANCELLED', label: 'Đã hủy' }
      ]
      : [
        { code: 'DRAFT', label: 'Bản nháp' },
        { code: 'ACTIVE', label: 'Đang thực hiện' },
        { code: 'READY_TO_HARVEST', label: 'Sẵn sàng thu hoạch' },
        { code: 'HARVESTING', label: 'Đang thu hoạch' },
        { code: 'COMPLETED', label: 'Hoàn thành' },
        { code: 'CANCELLED', label: 'Đã hủy' }
      ];

    return (
      <select
        value={statusCode}
        onChange={(e) => onStatusChange(e.target.value)}
        className={cn(
          "h-8 px-3 rounded font-black text-[10px] uppercase tracking-widest outline-none border-none shadow-sm cursor-pointer transition-all text-white",
          !statusColor && getColorClass(statusCode)
        )}
        style={statusColor ? { backgroundColor: statusColor } : {}}
      >
        {statuses.map(s => (
          <option key={s.code} value={s.code} className="bg-white text-slate-900">{s.label}</option>
        ))}
      </select>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          className="w-[320px] bg-white border-l border-slate-200 z-40 relative shadow-xl flex flex-col"
        >
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {currentSelection.type === 'PLAN' ? <Layout size={18} className="text-indigo-600" /> :
                currentSelection.type === 'PHASE' ? <Zap size={18} className="text-purple-600 fill-purple-600" /> :
                  <CheckSquare size={18} className="text-blue-600" />}
              <span className="text-[12px] font-black text-slate-400 tracking-widest uppercase">
                {currentSelection.type === 'PLAN' ? 'Plan' : currentSelection.type === 'PHASE' ? 'Stage' : 'Task'}
              </span>
            </div>
            <div className="flex gap-2">
              {canDelete && currentSelection.type !== 'PLAN' && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 text-rose-500 hover:bg-rose-50 rounded-xl"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 size={18} />
                </Button>
              )}
              <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-400 hover:bg-slate-50 rounded-xl" onClick={onClose}>
                <X size={18} />
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
            {renderBreadcrumbs()}

            <div className="mb-8">
              {canEdit ? (
                <input
                  value={currentSelection.type === 'PLAN' ? currentSelection.plan.name :
                    currentSelection.type === 'PHASE' ? currentSelection.phase.name :
                      currentSelection.task.name}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (currentSelection.type === 'PLAN') onUpdatePlan({ ...currentSelection.plan, name: val });
                    else if (currentSelection.type === 'PHASE') onUpdatePhase(plan.id, { ...currentSelection.phase, name: val });
                    else if (currentSelection.type === 'TASK') onUpdateTask(plan.id, currentSelection.phase.id, { ...currentSelection.task, name: val });
                  }}
                  className="w-full text-2xl font-black text-slate-900 bg-transparent border-none outline-none focus:ring-0 p-0 mb-6 tracking-tight placeholder:text-slate-200"
                  placeholder="Nhập tên..."
                />
              ) : (
                <h2 className="text-2xl font-black text-slate-900 mb-6 tracking-tight">
                  {currentSelection.type === 'PLAN' ? currentSelection.plan.name :
                    currentSelection.type === 'PHASE' ? currentSelection.phase.name :
                      currentSelection.task.name}
                </h2>
              )}

              <div className="flex flex-wrap gap-4 items-center">
                {currentSelection.type === 'PLAN' && renderStatusDropdown(currentSelection.plan.status, (s) => onUpdatePlan({ ...currentSelection.plan, status: s as any }))}
                {currentSelection.type === 'PHASE' && renderStatusDropdown(currentSelection.phase.status, (s) => onUpdatePhase(plan.id, { ...currentSelection.phase, status: s }))}
                {currentSelection.type === 'TASK' && renderStatusDropdown(currentSelection.task.status, (s) => onUpdateTask(plan.id, currentSelection.phase.id, { ...currentSelection.task, status: s }))}

                {(currentSelection.type === 'PLAN' || currentSelection.type === 'PHASE') && (
                  <div className="grid grid-cols-2 gap-4 w-full mt-4">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-2 text-slate-400 mb-2">
                        <Clock size={14} />
                        <span className="text-[11px] font-black uppercase tracking-widest">Bắt đầu</span>
                      </div>
                      {canEdit ? (
                        <input
                          type="date"
                          value={currentSelection.type === 'PLAN' ? currentSelection.plan.startDate : currentSelection.phase.startDate}
                          onChange={(e) => {
                            if (currentSelection.type === 'PLAN') onUpdatePlan({ ...currentSelection.plan, startDate: e.target.value });
                            else if (currentSelection.type === 'PHASE') onUpdatePhase(plan.id, { ...currentSelection.phase, startDate: e.target.value });
                          }}
                          className="text-[12px] font-bold text-slate-800 bg-transparent border-none outline-none p-0 w-full"
                        />
                      ) : (
                        <div className="text-[12px] font-bold text-slate-800">
                          {currentSelection.type === 'PLAN' ? currentSelection.plan.startDate : currentSelection.phase.startDate}
                        </div>
                      )}
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-2 text-slate-400 mb-2">
                        <Clock size={14} />
                        <span className="text-[11px] font-black uppercase tracking-widest">Kết thúc</span>
                      </div>
                      {canEdit ? (
                        <input
                          type="date"
                          value={currentSelection.type === 'PLAN' ? currentSelection.plan.endDate : currentSelection.phase.endDate}
                          onChange={(e) => {
                            if (currentSelection.type === 'PLAN') onUpdatePlan({ ...currentSelection.plan, endDate: e.target.value });
                            else if (currentSelection.type === 'PHASE') onUpdatePhase(plan.id, { ...currentSelection.phase, endDate: e.target.value });
                          }}
                          className="text-[12px] font-bold text-slate-800 bg-transparent border-none outline-none p-0 w-full"
                        />
                      ) : (
                        <div className="text-[12px] font-bold text-slate-800">
                          {currentSelection.type === 'PLAN' ? currentSelection.plan.endDate : currentSelection.phase.endDate}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {currentSelection.type === 'PLAN' && canEdit && (
                  <div className="flex gap-2 w-full">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-[11px] font-bold text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                      onClick={() => currentSelection.type === 'PLAN' && onClone?.(currentSelection.plan)}
                    >
                      <Layout size={14} className="mr-2" /> Nhân bản
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 text-[11px] font-bold text-slate-500 hover:bg-slate-100">
                      <Plus size={14} className="mr-2" /> Ghép nối
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="mb-10">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Mô tả chi tiết</h3>
              {canEdit ? (
                <textarea
                  value={currentSelection.type === 'PLAN' ? (currentSelection.plan.description || "") :
                    currentSelection.type === 'PHASE' ? (currentSelection.phase.description || "") :
                      (currentSelection.task.description || "")}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (currentSelection.type === 'PLAN') onUpdatePlan({ ...currentSelection.plan, description: val });
                    else if (currentSelection.type === 'PHASE') onUpdatePhase(plan.id, { ...currentSelection.phase, description: val });
                    else if (currentSelection.type === 'TASK') onUpdateTask(plan.id, currentSelection.phase.id, { ...currentSelection.task, description: val });
                  }}
                  className="w-full text-[13px] text-slate-700 leading-relaxed font-medium bg-slate-50/50 border border-transparent hover:border-slate-200 focus:border-indigo-300 focus:bg-white p-3 rounded-xl outline-none transition-all min-h-[100px] resize-none"
                  placeholder="Thêm mô tả chi tiết cho công việc này..."
                />
              ) : (
                <p className="text-[13px] text-slate-700 leading-relaxed font-medium hover:bg-slate-50 p-2 -ml-2 rounded cursor-text capitalize">
                  {(currentSelection.type === 'PLAN' ? currentSelection.plan.description :
                    currentSelection.type === 'PHASE' ? currentSelection.phase.description :
                      currentSelection.task.description) || "Chưa có mô tả..."}
                </p>
              )}
            </div>

            {currentSelection.type === 'PHASE' && (
              <div className="mb-10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Danh sách công việc con</h3>
                  <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded uppercase">{currentSelection.phase.tasks.length} công việc</span>
                </div>

                <div className="border border-slate-100 rounded-xl overflow-hidden shadow-sm">
                  <table className="w-full border-collapse">
                    <thead className="bg-slate-50/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Task</th>
                        <th className="px-4 py-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {currentSelection.phase.tasks.map((task) => (
                        <tr
                          key={task.id}
                          className="hover:bg-slate-50/80 cursor-pointer group transition-colors"
                          onClick={() => onSelectTask(plan.id, currentSelection.phase.id, task.id)}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <CheckSquare size={14} className="text-blue-500 shrink-0" />
                              <span className="text-[12px] font-bold text-slate-700 truncate group-hover:text-indigo-600">
                                {task.name}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className={cn(
                              "text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-tighter",
                              (typeof task.status === 'string' ? task.status : task.status.code) === 'COMPLETED' ? "bg-slate-100 text-slate-400" :
                                (typeof task.status === 'string' ? task.status : task.status.code) === 'ACTIVE' ? "bg-indigo-100 text-indigo-700" :
                                  (typeof task.status === 'string' ? task.status : task.status.code) === 'HARVESTING' ? "bg-emerald-100 text-emerald-700" :
                                    "bg-slate-100 text-slate-500"
                            )}>
                              {(typeof task.status === 'string' ? task.status : task.status.code) === 'COMPLETED' ? 'Hoàn thành' : (typeof task.status === 'string' ? task.status : task.status.code) === 'ACTIVE' ? 'Đang làm' : ((typeof task.status === 'string' ? task.status : task.status.code) === 'HARVESTING' ? 'Thu hoạch' : 'Bản nháp')}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {isAddingTask ? (
                    <div className="p-4 bg-slate-50/50 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tên công việc</label>
                        <input
                          autoFocus
                          placeholder="VD: Bón phân thúc lần 1..."
                          value={newTaskName}
                          onChange={(e) => setNewTaskName(e.target.value)}
                          className="w-full px-3 py-2 text-[12px] font-bold bg-white border border-indigo-200 rounded-lg outline-none shadow-sm focus:ring-2 focus:ring-indigo-100"
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mô tả (tùy chọn)</label>
                        <textarea
                          placeholder="Chi tiết công việc..."
                          value={newTaskDesc}
                          onChange={(e) => setNewTaskDesc(e.target.value)}
                          className="w-full px-3 py-2 text-[12px] font-medium bg-white border border-slate-200 rounded-lg outline-none shadow-sm min-h-[60px] resize-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Bắt đầu</label>
                          <input
                            type="date"
                            value={newTaskStart || (currentSelection.type === 'PHASE' ? currentSelection.phase.startDate : '')}
                            onChange={(e) => setNewTaskStart(e.target.value)}
                            className="w-full px-2 py-1.5 text-[11px] font-bold bg-white border border-slate-200 rounded-lg outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kết thúc</label>
                          <input
                            type="date"
                            value={newTaskEnd || (currentSelection.type === 'PHASE' ? currentSelection.phase.endDate : '')}
                            onChange={(e) => setNewTaskEnd(e.target.value)}
                            className="w-full px-2 py-1.5 text-[11px] font-bold bg-white border border-slate-200 rounded-lg outline-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Lô đất thực hiện</label>
                        <select
                          value={newTaskPlotId}
                          onChange={(e) => setNewTaskPlotId(e.target.value)}
                          className="w-full px-3 py-2 text-[12px] font-bold bg-white border border-slate-200 rounded-lg outline-none shadow-sm"
                        >
                          <option value="">Chọn lô đất...</option>
                          {plots.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="flex-1 text-[11px] font-black uppercase text-slate-400"
                          onClick={() => setIsAddingTask(false)}
                        >
                          Hủy
                        </Button>
                        <Button 
                          size="sm" 
                          className="flex-1 text-[11px] font-black uppercase bg-indigo-600 text-white"
                          disabled={!newTaskName.trim()}
                          onClick={handleAddTaskSubmit}
                        >
                          Xác nhận
                        </Button>
                      </div>
                    </div>
                  ) : canEdit ? (
                    <button
                      onClick={() => {
                        setIsAddingTask(true);
                        // Pre-fill dates from phase
                        if (currentSelection.type === 'PHASE') {
                          setNewTaskStart(currentSelection.phase.startDate);
                          setNewTaskEnd(currentSelection.phase.endDate);
                        }
                      }}
                      className="w-full px-4 py-3 text-[11px] font-black text-slate-400 hover:text-indigo-600 hover:bg-slate-50 transition-all text-left flex items-center gap-2"
                    >
                      <Plus size={14} />
                      THÊM CÔNG VIỆC CON
                    </button>
                  ) : null}
                </div>
              </div>
            )}

            {currentSelection.type === 'TASK' && (
              <div className="space-y-6 animate-in slide-in-from-bottom-2">
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  {(['INFO', 'MEMBERS', 'MATERIALS'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={cn(
                        "flex-1 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all",
                        activeTab === tab ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                      )}
                    >
                      {tab === 'INFO' ? 'Thông tin' : tab === 'MEMBERS' ? 'Nhân sự' : 'Vật tư'}
                    </button>
                  ))}
                </div>

                {activeTab === 'INFO' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-2 text-slate-400 mb-2">
                          <Clock size={14} />
                          <span className="text-[11px] font-black uppercase tracking-widest">Bắt đầu</span>
                        </div>
                        {canEdit ? (
                          <input
                            type="date"
                            value={currentSelection.task.startDate}
                            onChange={(e) => onUpdateTask(plan.id, currentSelection.phase.id, { ...currentSelection.task, startDate: e.target.value })}
                            className="text-[12px] font-bold text-slate-800 bg-transparent border-none outline-none p-0 w-full"
                          />
                        ) : (
                          <div className="text-[12px] font-bold text-slate-800">
                            {currentSelection.task.startDate}
                          </div>
                        )}
                      </div>
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-2 text-slate-400 mb-2">
                          <Clock size={14} />
                          <span className="text-[11px] font-black uppercase tracking-widest">Kết thúc</span>
                        </div>
                        {canEdit ? (
                          <input
                            type="date"
                            value={currentSelection.task.endDate}
                            onChange={(e) => onUpdateTask(plan.id, currentSelection.phase.id, { ...currentSelection.task, endDate: e.target.value })}
                            className="text-[12px] font-bold text-slate-800 bg-transparent border-none outline-none p-0 w-full"
                          />
                        ) : (
                          <div className="text-[12px] font-bold text-slate-800">
                            {currentSelection.task.endDate}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 text-indigo-600">
                          <Activity size={14} />
                          <span className="text-[11px] font-black uppercase tracking-widest">Tiến độ thực hiện</span>
                        </div>
                        <span className="text-[13px] font-black text-indigo-700">{currentSelection.task.progressPercent}%</span>
                      </div>
                      <div className="h-2 bg-indigo-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${currentSelection.task.progressPercent}%` }}
                          className="h-full bg-indigo-500"
                        />
                      </div>
                      <input
                        type="range"
                        min="0" max="100"
                        value={currentSelection.task.progressPercent}
                        onChange={(e) => onUpdateTask(plan.id, currentSelection.phase.id, { ...currentSelection.task, progressPercent: parseInt(e.target.value) })}
                        disabled={currentSelection.task.status.code === 'COMPLETED' || currentSelection.task.status.code === 'CANCELLED'}
                        className="w-full mt-4 h-1 bg-indigo-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 disabled:opacity-50"
                      />
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      <div className="flex items-center gap-2 text-slate-400 mb-3">
                        <Plus size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Minh chứng hoàn thành</span>
                      </div>
                      <div className="flex flex-col items-center justify-center py-4 border-2 border-dashed border-slate-200 rounded-xl bg-white hover:bg-slate-50 cursor-pointer transition-colors">
                        <Activity size={20} className="text-slate-300 mb-2" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Tải lên hình ảnh/video</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'MEMBERS' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Danh sách nhân sự</h4>
                      <button className="text-slate-300 cursor-not-allowed"><Plus size={16} /></button>
                    </div>

                    <div className="py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      <Users size={24} className="mx-auto text-slate-300 mb-2" />
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Tính năng phân công đang phát triển</p>
                    </div>

                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 flex gap-2">
                      <AlertCircle size={16} className="text-amber-600 shrink-0" />
                      <p className="text-[10px] text-amber-900 font-medium leading-relaxed">
                        Tính năng gán nhân sự trực tiếp từ kế hoạch sẽ sớm được ra mắt khi hệ thống quản lý nhân sự hoàn tất.
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === 'MATERIALS' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Vật tư dự kiến</h4>
                    </div>

                    <div className="space-y-2">
                      {currentSelection.task.materials && currentSelection.task.materials.length > 0 ? (
                        currentSelection.task.materials.map((mat: any) => (
                          <div key={mat.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 group">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Package size={14} className="text-slate-400" />
                                <span className="text-[12px] font-bold text-slate-800">{mat.name}</span>
                              </div>
                              <span className="text-[10px] font-black text-indigo-600">{mat.quantity} {mat.unit || 'đơn vị'}</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                          <Package size={24} className="mx-auto text-slate-300 mb-2" />
                          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Chưa có vật tư dự kiến</p>
                        </div>
                      )}
                    </div>
                    <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100 flex gap-2">
                      <CheckCircle2 size={16} className="text-indigo-600 shrink-0" />
                      <p className="text-[10px] text-indigo-900 font-medium leading-relaxed">
                        Liên kết tự động với module kho để trừ tồn kho khi xuất vật tư.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Delete Confirmation Modal */}
          {createPortal(
            <AnimatePresence>
              {showDeleteConfirm && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-slate-100"
                  >
                    <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center text-rose-600 mb-6">
                      <Trash2 size={32} />
                    </div>
                    <h3 className="text-xl font-black text-slate-800 mb-2">
                      {currentSelection.type === 'PHASE' ? 'Xóa giai đoạn?' : 'Xóa công việc?'}
                    </h3>
                    <p className="text-sm text-slate-500 mb-8 leading-relaxed">
                      {currentSelection.type === 'PHASE'
                        ? 'Bạn có chắc chắn muốn xóa giai đoạn này? Tất cả công việc bên trong cũng sẽ bị xóa.'
                        : 'Dữ liệu này sẽ được gỡ bỏ khỏi hệ thống. Hành động này không thể hoàn tác.'
                      }
                    </p>
                    <div className="flex gap-3">
                      <Button
                        variant="ghost"
                        className="flex-1 py-6 font-black uppercase tracking-widest text-slate-400"
                        onClick={() => setShowDeleteConfirm(false)}
                      >
                        Hủy
                      </Button>
                      <Button
                        className="flex-1 py-6 font-black uppercase tracking-widest bg-rose-600 hover:bg-rose-700 text-white"
                        onClick={handleDelete}
                      >
                        Xác nhận
                      </Button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>,
            document.body
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
