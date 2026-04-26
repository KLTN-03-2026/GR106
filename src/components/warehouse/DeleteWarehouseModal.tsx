import { Trash2, AlertTriangle, X, Loader2 } from 'lucide-react'
import { Warehouse } from '@/types/warehouse/warehouse'

interface DeleteWarehouseModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  warehouse: Warehouse | null
  loading: boolean
}

export function DeleteWarehouseModal({ isOpen, onClose, onConfirm, warehouse, loading }: DeleteWarehouseModalProps) {
  if (!isOpen || !warehouse) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100">
        <div className="p-8">
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-50 text-slate-400 transition-colors"
          >
            <X size={20} />
          </button>

          {/* Icon Header */}
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-rose-50 rounded-[32px] flex items-center justify-center mb-6 relative">
              <div className="absolute inset-0 bg-rose-100/50 rounded-[32px] animate-pulse" />
              <Trash2 className="w-10 h-10 text-rose-500 relative z-10" />
            </div>

            <h3 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
              Xác nhận xóa kho hàng
            </h3>
            <p className="text-slate-500 font-medium px-4 leading-relaxed">
              Bạn có chắc chắn muốn xóa kho hàng <span className="text-slate-900 font-bold">"{warehouse.name}"</span>? 
              <br />Hành động này không thể hoàn tác.
            </p>
          </div>

          {/* Alert Box */}
          <div className="mt-8 p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3 items-start text-left">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 font-medium leading-relaxed">
              Việc xóa kho hàng có thể ảnh hưởng đến các dữ liệu liên quan về vị trí lưu trữ và lịch sử xuất nhập kho.
            </p>
          </div>

          {/* Actions */}
          <div className="mt-8 flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-4 px-6 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold rounded-2xl transition-all active:scale-95 disabled:opacity-50"
            >
              Hủy bỏ
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 py-4 px-6 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-rose-200 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                'Xác nhận xóa'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
