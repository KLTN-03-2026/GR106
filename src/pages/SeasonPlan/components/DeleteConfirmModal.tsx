import { AlertTriangle} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SeasonPlan } from '../../../types/seasonPlan';
import { Button } from '../../../components/ui/button';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  plan: SeasonPlan | null;
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  plan,
}: DeleteConfirmModalProps) {
  if (!isOpen || !plan) return null;

  const isOngoing = ['ACTIVE', 'READY_TO_HARVEST', 'HARVESTING'].includes(plan.status);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden border border-slate-100"
        >
          <div className="p-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-rose-100 rounded-3xl flex items-center justify-center text-rose-600 mb-6">
                <AlertTriangle size={32} />
              </div>
              
              <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-2">
                Xác nhận gỡ bỏ?
              </h3>
              
              <div className="text-sm text-slate-500 font-bold leading-relaxed mb-6 px-4">
                Bạn có chắc chắn muốn xóa kế hoạch <span className="text-slate-900">"{plan.name}"</span>? 
                Hành động này không thể hoàn tác.
              </div>

              {isOngoing && (
                <div className="w-full p-4 bg-amber-50 rounded-2xl border border-amber-200 mb-6 flex gap-3 text-left">
                  <div className="w-5 h-5 bg-amber-200 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[10px] font-black text-amber-700">!</span>
                  </div>
                  <p className="text-xs font-bold text-amber-700 leading-normal">
                    Lưu ý: Kế hoạch đang thực hiện. Các công việc chưa bắt đầu sẽ được chuyển sang trạng thái "Đã hủy".
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                className="flex-1 py-6 rounded-2xl font-black uppercase tracking-wider text-slate-400 hover:text-slate-600"
              >
                Giữ lại
              </Button>
              <Button
                type="button"
                onClick={onConfirm}
                className="flex-[2] py-6 rounded-2xl font-black uppercase tracking-wider bg-rose-600 text-white shadow-xl shadow-rose-200 hover:bg-rose-700 transition-all border-none"
              >
                Đồng ý xóa
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
