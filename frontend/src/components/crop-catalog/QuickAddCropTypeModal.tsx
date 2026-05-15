import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Save } from 'lucide-react';
import { createCropTypeSchema, CreateCropTypeInput } from '@/schemas/cropSchemas';

interface QuickAddCropTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateCropTypeInput) => Promise<void>;
  loading: boolean;
}

export const QuickAddCropTypeModal: React.FC<QuickAddCropTypeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  loading
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateCropTypeInput>({
    resolver: zodResolver(createCropTypeSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  if (!isOpen) return null;

  const onSubmit = async (data: CreateCropTypeInput) => {
    await onSave(data);
    reset();
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-[32px] w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-xl font-bold text-slate-800 tracking-tight">Thêm loại cây mới</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Tên loại cây *</label>
            <input
              {...register('name')}
              placeholder="Ví dụ: Rau, Củ, Quả, Lúa, Hoa..."
              className={`w-full px-5 py-3 bg-slate-50 border ${errors.name ? 'border-red-300 bg-red-50' : 'border-slate-200'} rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all`}
            />
            {errors.name && <p className="mt-2 text-xs font-bold text-red-500">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Mô tả (Tùy chọn)</label>
            <textarea
              {...register('description')}
              rows={3}
              placeholder="Ghi chú về nhóm cây này..."
              className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-3 px-6 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-colors active:scale-95 disabled:opacity-50"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 px-6 bg-green-600 text-white font-bold rounded-2xl hover:bg-green-700 transition-all shadow-lg shadow-green-100 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              Lưu lại
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
