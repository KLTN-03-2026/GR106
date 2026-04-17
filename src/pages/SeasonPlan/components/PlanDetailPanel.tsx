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
  User,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SeasonPlan, PlanStatus, Phase, Task } from '../../../types/seasonPlan';
import { cn } from '../../../utils/cn';
import { Button } from '../../../components/ui/button';
import { canEditPlan } from '../../../utils/seasonPlanUtils';
import { UserInfo } from '../../../types/auth/auth';

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
  user?: UserInfo | null;
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
  user
}: PlanDetailPanelProps) {
  const canEdit = canEditPlan(user?.role);
  const canDelete = canEditPlan(user?.role); // Simplified for PB11: owner/admin can delete
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const addTaskRef = useRef<HTMLInputElement>(null);

  if (!selection) return null;

  const { plan } = selection;

  const handleDelete = () => {
    if (selection.type === 'PLAN') {
      const isOngoing = ['ACTIVE', 'READY_TO_HARVEST', 'HARVESTING'].includes(plan.status);
      if (isOngoing) {
        const updatedPhases = plan.phases.map(p => 
          p.status === 'DRAFT' ? { ...p, status: 'CANCELLED' as PlanStatus, tasks: p.tasks.map(t => ({ ...t, status: 'CANCELLED' as PlanStatus })) } : p
        );
        onUpdatePlan({ ...plan, status: 'CANCELLED', phases: updatedPhases });
      } else if (onDeletePlan) {
        onDeletePlan(plan.id);
      }
      onClose();
    }
  };

  const handleAddTaskSubmit = () => {
    if (selection.type === 'PHASE' && addTaskRef.current?.value) {
      onAddTask(plan.id, selection.phase.id, addTaskRef.current.value.trim());
      addTaskRef.current.value = '';
      setIsAddingTask(false);
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

  const renderStatusDropdown = (currentStatus: PlanStatus, onStatusChange: (s: PlanStatus) => void) => {
    const getLabel = (s: PlanStatus) => {
      switch (s) {
        case 'DRAFT': return 'Bản nháp';
        case 'ACTIVE': return 'Đang thực hiện';
        case 'READY_TO_HARVEST': return 'Sẵn sàng thu hoạch';
        case 'HARVESTING': return 'Đang thu hoạch';
        case 'COMPLETED': return 'Hoàn thành';
        case 'CANCELLED': return 'Đã hủy';
        default: return s;
      }
    };

    const getColorClass = (s: PlanStatus) => {
      switch (s) {
        case 'ACTIVE': return "bg-indigo-600 text-white";
        case 'READY_TO_HARVEST': return "bg-lime-600 text-white";
        case 'HARVESTING': return "bg-emerald-600 text-white";
        case 'COMPLETED': return "bg-slate-400 text-white";
        case 'CANCELLED': return "bg-rose-600 text-white";
        default: return "bg-slate-200 text-slate-700";
      }
    };

    if (!canEdit) {
      return (
        <div className={cn(
          "h-8 px-3 rounded flex items-center font-black text-[10px] uppercase tracking-widest shadow-sm",
          getColorClass(currentStatus)
        )}>
           {getLabel(currentStatus)}
        </div>
      );
    }
    return (
      <select
        value={currentStatus}
        onChange={(e) => onStatusChange(e.target.value as PlanStatus)}
        className={cn(
          "h-8 px-3 rounded font-black text-[10px] uppercase tracking-widest outline-none border-none shadow-sm cursor-pointer transition-all",
          getColorClass(currentStatus)
        )}
      >
        <option value="DRAFT" className="bg-white text-slate-900">Bản nháp</option>
        <option value="ACTIVE" className="bg-white text-slate-900">Đang thực hiện</option>
        <option value="READY_TO_HARVEST" className="bg-white text-slate-900">Sẵn sàng thu hoạch</option>
        <option value="HARVESTING" className="bg-white text-slate-900">Đang thu hoạch</option>
        <option value="COMPLETED" className="bg-white text-slate-900">Hoàn thành</option>
        <option value="CANCELLED" className="bg-white text-slate-900">Đã hủy</option>
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
          {/* Header Toolbar */}
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
              {canDelete && (
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

            {/* Title & Main Actions */}
            <div className="mb-8">
              <h2 className="text-2xl font-black text-slate-900 mb-6 tracking-tight">
                {selection.type === 'PLAN' ? selection.plan.name :
                 selection.type === 'PHASE' ? selection.phase.name :
                 selection.task.name}
              </h2>

              <div className="flex flex-wrap gap-4 items-center">
                 {selection.type === 'PHASE' && renderStatusDropdown(selection.phase.status, (s) => onUpdatePhase(plan.id, { ...selection.phase, status: s }))}
                 {selection.type === 'TASK' && renderStatusDropdown(selection.task.status, (s) => onUpdateTask(plan.id, selection.phase.id, { ...selection.task, status: s }))}
                 
                 {canEdit && (
                   <Button variant="ghost" size="sm" className="h-8 text-[11px] font-bold text-slate-500 hover:bg-slate-100">
                      <Plus size={14} className="mr-2" /> Ghép nối
                   </Button>
                 )}
              </div>
            </div>

            {/* Description */}
            <div className="mb-10">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Mô tả chi tiết</h3>
              <p className="text-[13px] text-slate-700 leading-relaxed font-medium hover:bg-slate-50 p-2 -ml-2 rounded cursor-text">
                 {selection.type === 'PLAN' ? selection.plan.description :
                  selection.type === 'PHASE' ? selection.phase.description :
                  selection.task.description} || "Chưa có mô tả..."
              </p>
            </div>

            {/* Child items - PHASE ONLY */}
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
                               task.status === 'COMPLETED' ? "bg-slate-100 text-slate-400" :
                               task.status === 'ACTIVE' ? "bg-indigo-100 text-indigo-700" :
                               task.status === 'HARVESTING' ? "bg-emerald-100 text-emerald-700" :
                               "bg-slate-100 text-slate-500"
                             )}>
                               {task.status === 'COMPLETED' ? 'Hoàn thành' : task.status === 'ACTIVE' ? 'Đang làm' : (task.status === 'HARVESTING' ? 'Thu hoạch' : 'Bản nháp')}
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
                          if (e.key === 'Enter') handleAddTaskSubmit();
                          if (e.key === 'Escape') setIsAddingTask(false);
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

            {/* Task specific details */}
            {selection.type === 'TASK' && (
              <div className="space-y-6 animate-in slide-in-from-bottom-2">
                 <div className="grid grid-cols-2 gap-6">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                       <div className="flex items-center gap-2 text-slate-400 mb-2">
                          <Clock size={14} />
                          <span className="text-[11px] font-black uppercase tracking-widest">Thời gian</span>
                       </div>
                       <div className="text-[13px] font-bold text-slate-800">
                         {selection.task.duration} ngày
                       </div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                       <div className="flex items-center gap-2 text-slate-400 mb-2">
                          <User size={14} />
                          <span className="text-[11px] font-black uppercase tracking-widest">Phụ trách</span>
                       </div>
                       <div className="text-[13px] font-bold text-slate-800">
                         Admin
                       </div>
                    </div>
                 </div>
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
                  {['ACTIVE', 'READY_TO_HARVEST', 'HARVESTING'].includes(plan.status) ? 'Hủy kế hoạch?' : 'Xóa kế hoạch?'}
                </h3>
                <p className="text-sm text-slate-500 mb-8 leading-relaxed">
                  {['ACTIVE', 'READY_TO_HARVEST', 'HARVESTING'].includes(plan.status) 
                    ? 'Kế hoạch này đang thực hiện. Việc xóa sẽ chuyển tất cả công việc chưa bắt đầu sang trạng thái "Đã hủy". Bạn có chắc chắn không?'
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
