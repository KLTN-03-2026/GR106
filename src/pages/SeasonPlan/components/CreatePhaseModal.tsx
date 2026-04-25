import React, { useEffect, useState } from 'react';
import { X, Info, Loader2, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../../../components/ui/button';
import { DateInput } from '../../../components/ui/DateInput';
import { createPhaseSchema } from '../../../schemas/seasonPlanSchemas';

interface CreatePhaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { name: string; startDate: string; endDate: string }) => void;
  isLoading?: boolean;
  initialData?: {
    name?: string;
    startDate?: string;
    endDate?: string;
  };
}

export function CreatePhaseModal({
  isOpen,
  onClose,
  onSave,
  isLoading = false,
  initialData,
}: CreatePhaseModalProps) {
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setName(initialData?.name || '');
      setStartDate(initialData?.startDate || '');
      setEndDate(initialData?.endDate || '');
      setError('');
    }
  }, [isOpen, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const validation = createPhaseSchema.safeParse({
      name,
      startDate,
      endDate,
    });

    if (!validation.success) {
      setError(validation.error.errors[0].message);
      return;
    }

    onSave({
      name: validation.data.name,
      startDate: validation.data.startDate,
      endDate: validation.data.endDate,
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden border border-slate-100"
        >
          <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600">
                <Zap size={20} fill="currentColor" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-800 tracking-tight">Thêm giai đoạn mới</h2>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Phân kỳ quy trình sản xuất</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white rounded-xl transition-colors text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {error && (
              <div className="p-4 text-xs font-bold text-rose-600 bg-rose-50 rounded-2xl border border-rose-100 flex items-center gap-2">
                <Info size={14} />
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Tên giai đoạn</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ví dụ: Làm đất, Bón phân..."
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-purple-500/20 focus:bg-white rounded-2xl py-3 px-4 outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <DateInput
                  label="Ngày bắt đầu"
                  value={startDate}
                  onChange={setStartDate}
                />
                <DateInput
                  label="Ngày kết thúc"
                  value={endDate}
                  onChange={setEndDate}
                />
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                className="flex-1 py-6 rounded-2xl font-black uppercase tracking-wider text-slate-400 hover:text-slate-600"
              >
                Hủy bỏ
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-[2] py-6 rounded-2xl font-black uppercase tracking-wider bg-slate-900 text-white shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all border-none relative overflow-hidden"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="animate-spin" size={18} />
                    <span>Đang lưu...</span>
                  </div>
                ) : (
                  'Lưu giai đoạn'
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
