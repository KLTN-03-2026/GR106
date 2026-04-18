import { useState, useRef } from 'react';
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
  onAddTask: (planId: string, phaseId: string, name: string) => void;
  onUpdateTask: (planId: string, phaseId: string, task: Task) => void;
  onSelectPhase: (planId: string, phaseId: string) => void;
  onSelectTask: (planId: string, phaseId: string, taskId: string) => void;
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
  onDeletePlan,
  onDeletePhase,
  onDeleteTask,
  onClone,
  canEdit = false,
}: PlanDetailPanelProps) {
  const canDelete = canEdit;
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const addTaskRef = useRef<HTMLInputElement>(null);
  // UI logic
  const [activeTab, setActiveTab] = useState<'INFO' | 'MEMBERS' | 'MATERIALS'>('INFO');

  if (!selection) return null;

  const { plan } = selection;

  const handleDelete = () => {
    setShowDeleteConfirm(false);
    if (selection.type === 'PLAN') {
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
    } else if (selection.type === 'PHASE') {
      if (onDeletePhase) {
        onDeletePhase(plan.id, selection.phase.id);
        onClose();
      }
    } else if (selection.type === 'TASK') {
      if (onDeleteTask) {
        onDeleteTask(plan.id, selection.phase.id, selection.task.id);
        onClose();
      }
    }
  };

  const handleAddTaskSubmit = () => {
    const name = addTaskRef.current?.value;
    console.log('[PlanDetailPanel] handleAddTaskSubmit:', { type: selection.type, name });
    if (selection.type === 'PHASE' && name) {
      onAddTask(plan.id, selection.phase.id, name.trim());
      addTaskRef.current.value = '';
      setIsAddingTask(false);
    } else {
      console.warn('[PlanDetailPanel] Cannot add task: invalid state or name', { type: selection.type, name });
    }
  };

  const renderBreadcrumbs = () => {
    return (
      <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 mb-4 px-1">
        <span className="hover:text-slate-900 cursor-pointer transition-colors truncate max-w-[100px]">{plan.name}</span>
        {selection.type !== 'PLAN' && (
          <>
            <ChevronRight size={12} className="shrink-0" />
            <span
              className={cn(
                "hover:text-slate-900 cursor-pointer transition-colors truncate max-w-[100px]",
                selection.type === 'PHASE' && "text-slate-900"
              )}
              onClick={() => onSelectPhase(plan.id, selection.type === 'PHASE' ? selection.phase.id : selection.phase.id)}
            >
              {selection.type === 'PHASE' ? selection.phase.name : selection.phase.name}
            </span>
          </>
        )}
        {selection.type === 'TASK' && (
          <>
            <ChevronRight size={12} className="shrink-0" />
            <span className="text-slate-900 truncate max-w-[100px]">{selection.task.name}</span>
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
        <div className={cn(
          "h-8 px-3 rounded flex items-center font-black text-[10px] uppercase tracking-widest shadow-sm",
          getColorClass(statusCode),
          statusColor && statusCode === 'CUSTOM' ? `bg-[${statusColor}]` : ''
        )}>
          {statusName}
        </div>
      );
    }

    const statuses = selection?.type === 'TASK'
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
          "h-8 px-3 rounded font-black text-[10px] uppercase tracking-widest outline-none border-none shadow-sm cursor-pointer transition-all",
          getColorClass(statusCode)
        )}
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
              {selection.type === 'PLAN' ? <Layout size={18} className="text-indigo-600" /> :
                selection.type === 'PHASE' ? <Zap size={18} className="text-purple-600 fill-purple-600" /> :
                  <CheckSquare size={18} className="text-blue-600" />}
              <span className="text-[12px] font-black text-slate-400 tracking-widest uppercase">
                {selection.type === 'PLAN' ? 'Plan' : selection.type === 'PHASE' ? 'Stage' : 'Task'}
              </span>
            </div>
            <div className="flex gap-2">
              {canDelete && selection.type !== 'PLAN' && (
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
                  value={selection.type === 'PLAN' ? selection.plan.name :
                    selection.type === 'PHASE' ? selection.phase.name :
                      selection.task.name}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (selection.type === 'PLAN') onUpdatePlan({ ...selection.plan, name: val });
                    else if (selection.type === 'PHASE') onUpdatePhase(plan.id, { ...selection.phase, name: val });
                    else onUpdateTask(plan.id, selection.phase.id, { ...selection.task, name: val });
                  }}
                  className="w-full text-2xl font-black text-slate-900 bg-transparent border-none outline-none focus:ring-0 p-0 mb-6 tracking-tight placeholder:text-slate-200"
                  placeholder="Nhập tên..."
                />
              ) : (
                <h2 className="text-2xl font-black text-slate-900 mb-6 tracking-tight">
                  {selection.type === 'PLAN' ? selection.plan.name :
                    selection.type === 'PHASE' ? selection.phase.name :
                      selection.task.name}
                </h2>
              )}

              <div className="flex flex-wrap gap-4 items-center">
                {selection.type === 'PHASE' && renderStatusDropdown(selection.phase.status, (s) => onUpdatePhase(plan.id, { ...selection.phase, status: s }))}
                {selection.type === 'TASK' && renderStatusDropdown(selection.task.status, (s) => onUpdateTask(plan.id, selection.phase.id, { ...selection.task, status: s }))}

                {canEdit && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-[11px] font-bold text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                      onClick={() => selection.type === 'PLAN' && onClone?.(selection.plan)}
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
                  value={selection.type === 'PLAN' ? (selection.plan.description || "") :
                    selection.type === 'PHASE' ? (selection.phase.description || "") :
                      (selection.task.description || "")}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (selection.type === 'PLAN') onUpdatePlan({ ...selection.plan, description: val });
                    else if (selection.type === 'PHASE') onUpdatePhase(plan.id, { ...selection.phase, description: val });
                    else onUpdateTask(plan.id, selection.phase.id, { ...selection.task, description: val });
                  }}
                  className="w-full text-[13px] text-slate-700 leading-relaxed font-medium bg-slate-50/50 border border-transparent hover:border-slate-200 focus:border-indigo-300 focus:bg-white p-3 rounded-xl outline-none transition-all min-h-[100px] resize-none"
                  placeholder="Thêm mô tả chi tiết cho công việc này..."
                />
              ) : (
                <p className="text-[13px] text-slate-700 leading-relaxed font-medium hover:bg-slate-50 p-2 -ml-2 rounded cursor-text capitalize">
                  {(selection.type === 'PLAN' ? selection.plan.description :
                    selection.type === 'PHASE' ? selection.phase.description :
                      selection.task.description) || "Chưa có mô tả..."}
                </p>
              )}
            </div>

            {selection.type === 'PHASE' && (
              <div className="mb-10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Danh sách công việc con</h3>
                  <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded uppercase">{selection.phase.tasks.length} công việc</span>
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
                      {selection.phase.tasks.map((task) => (
                        <tr
                          key={task.id}
                          className="hover:bg-slate-50/80 cursor-pointer group transition-colors"
                          onClick={() => onSelectTask(plan.id, selection.phase.id, task.id)}
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
                    <div className="p-3 bg-slate-50/50">
                      <input
                        ref={addTaskRef}
                        autoFocus
                        placeholder="Nhập tên công việc con..."
                        className="w-full px-3 py-2 text-[12px] font-bold bg-white border border-indigo-200 rounded-lg outline-none shadow-sm"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            e.stopPropagation();
                            handleAddTaskSubmit();
                          }
                          if (e.key === 'Escape') {
                            e.preventDefault();
                            e.stopPropagation();
                            setIsAddingTask(false);
                          }
                        }}
                        onBlur={() => {
                          // Small delay to allow Enter key to be processed before blur unmounts the input
                          setTimeout(() => setIsAddingTask(false), 100);
                        }}
                      />
                    </div>
                  ) : canEdit ? (
                    <button
                      onClick={() => setIsAddingTask(true)}
                      className="w-full px-4 py-3 text-[11px] font-black text-slate-400 hover:text-indigo-600 hover:bg-slate-50 transition-all text-left flex items-center gap-2"
                    >
                      <Plus size={14} />
                      THÊM CÔNG VIỆC CON
                    </button>
                  ) : null}
                </div>
              </div>
            )}

            {selection.type === 'TASK' && (
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
                            value={selection.task.startDate}
                            onChange={(e) => onUpdateTask(plan.id, selection.phase.id, { ...selection.task, startDate: e.target.value })}
                            className="text-[12px] font-bold text-slate-800 bg-transparent border-none outline-none p-0 w-full"
                          />
                        ) : (
                          <div className="text-[12px] font-bold text-slate-800">
                            {selection.task.startDate}
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
                            value={selection.task.endDate}
                            onChange={(e) => onUpdateTask(plan.id, selection.phase.id, { ...selection.task, endDate: e.target.value })}
                            className="text-[12px] font-bold text-slate-800 bg-transparent border-none outline-none p-0 w-full"
                          />
                        ) : (
                          <div className="text-[12px] font-bold text-slate-800">
                            {selection.task.endDate}
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
                        <span className="text-[13px] font-black text-indigo-700">{selection.task.progressPercent}%</span>
                      </div>
                      <div className="h-2 bg-indigo-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${selection.task.progressPercent}%` }}
                          className="h-full bg-indigo-500"
                        />
                      </div>
                      <input
                        type="range"
                        min="0" max="100"
                        value={selection.task.progressPercent}
                        onChange={(e) => onUpdateTask(plan.id, selection.phase.id, { ...selection.task, progressPercent: parseInt(e.target.value) })}
                        disabled={selection.task.status.code === 'COMPLETED' || selection.task.status.code === 'CANCELLED'}
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
                      {selection.task.materials && selection.task.materials.length > 0 ? (
                        selection.task.materials.map((mat: any) => (
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
                      {selection.type === 'PHASE' ? 'Xóa giai đoạn?' : 'Xóa công việc?'}
                    </h3>
                    <p className="text-sm text-slate-500 mb-8 leading-relaxed">
                      {selection.type === 'PHASE'
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
