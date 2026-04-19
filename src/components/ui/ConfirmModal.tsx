import { Modal } from './Modal';
import { Button } from './button';
import { AlertCircle, HelpCircle } from 'lucide-react';
import { cn } from '../../utils/cn';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  type?: 'danger' | 'warning' | 'info';
  loading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Xác nhận',
  cancelLabel = 'Hủy',
  type = 'danger',
  loading = false
}: ConfirmModalProps) {
  const getIcon = () => {
    switch (type) {
      case 'danger': return <AlertCircle size={40} />;
      case 'warning': return <AlertCircle size={40} />;
      default: return <HelpCircle size={40} />;
    }
  };

  const getTypeColors = () => {
    switch (type) {
      case 'danger': return 'bg-rose-50 text-rose-500';
      case 'warning': return 'bg-amber-50 text-amber-500';
      default: return 'bg-indigo-50 text-indigo-500';
    }
  };

  const getButtonClass = () => {
    switch (type) {
      case 'danger': return 'bg-rose-500 hover:bg-rose-600 shadow-rose-100 focus:ring-rose-500';
      case 'warning': return 'bg-amber-500 hover:bg-amber-600 shadow-amber-100 focus:ring-amber-500';
      default: return 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100 focus:ring-indigo-500';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white rounded-[32px] p-8 w-full max-w-sm overflow-hidden border border-slate-100 shadow-2xl">
        <div className="flex flex-col items-center text-center">
          <div className={cn(
            "w-20 h-20 rounded-3xl flex items-center justify-center mb-6 transition-transform duration-500",
            isOpen ? "scale-100" : "scale-50",
            getTypeColors()
          )}>
            {getIcon()}
          </div>
          
          <h3 className="text-xl font-black text-slate-800 tracking-tight mb-2">
            {title}
          </h3>
          
          <p className="text-sm font-medium text-slate-500 mb-8 leading-relaxed">
            {message}
          </p>

          <div className="flex flex-col w-full gap-3">
            <Button
              onClick={onConfirm}
              disabled={loading}
              className={cn(
                "w-full py-6 rounded-2xl font-black uppercase tracking-wider text-white border-none shadow-lg transition-all active:scale-95",
                getButtonClass()
              )}
            >
              {loading ? 'Đang xử lý...' : confirmLabel}
            </Button>
            <Button
              variant="ghost"
              onClick={onClose}
              disabled={loading}
              className="w-full py-6 rounded-2xl font-bold uppercase tracking-wider text-slate-400 hover:text-slate-600 hover:bg-slate-50 border-none transition-all"
            >
              {cancelLabel}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
