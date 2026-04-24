import { Trash2Icon } from 'lucide-react';
import { Plot } from '../../../types/plot';

interface Props {
  plot: Plot | null;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeletePlotDialog({ plot, onClose, onConfirm }: Props) {
  if (!plot) return null;
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-[340px] mx-4 font-sans">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-red-100 rounded-xl">
            <Trash2Icon className="w-4 h-4 text-red-600" />
          </div>
          <h3 className="text-sm font-bold text-gray-900">Xóa lô đất</h3>
        </div>
        <p className="text-sm text-gray-600 mb-5 leading-relaxed">
          Bạn có chắc muốn xóa <span className="font-semibold text-gray-900">"{plot.name}"</span>? Hành động này không thể hoàn tác.
        </p>
        <div className="flex gap-2 justify-end">
          <button 
            onClick={onClose} 
            className="px-3 py-2 rounded-xl text-xs font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Hủy
          </button>
          <button 
            onClick={onConfirm} 
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors shadow-sm"
          >
            Xóa lô đất
          </button>
        </div>
      </div>
    </div>
  );
}
