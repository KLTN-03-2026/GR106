import { AlertTriangleIcon, XIcon, ClipboardListIcon } from 'lucide-react'
import { Plot } from '../../../schemas/plotSchemas'

interface DeletePlotDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (plotId: string) => void
  plot: Plot | null
  hasActiveTasks?: boolean // Điều kiện từ tài liệu PB06
}

export function DeletePlotDialog({
  isOpen,
  onClose,
  onConfirm,
  plot,
  hasActiveTasks = false,
}: DeletePlotDialogProps) {
  if (!isOpen || !plot) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 font-sans">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-start p-5">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl shadow-sm ${hasActiveTasks ? 'bg-amber-100 text-amber-600 border border-amber-200' : 'bg-red-100 text-red-600 border border-red-200'}`}>
              <AlertTriangleIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {hasActiveTasks ? 'Không thể xóa lô đất' : 'Xác nhận xóa lô đất'}
              </h2>
              <p className="text-xs text-gray-500 font-medium uppercase mt-0.5 tracking-wider">Hành động không thể hoàn tác</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-xl transition-all"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 pb-6">
          {hasActiveTasks ? (
            <div className="space-y-5">
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                <p className="text-sm text-amber-800 leading-relaxed font-medium">
                  Lô đất <span className="font-bold underline">"{plot.name}"</span> hiện đang có kế hoạch hoặc công việc chưa hoàn thành. Vui lòng kiểm tra và xử lý trước khi xóa.
                </p>
              </div>
              
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-inner">
                <div className="flex items-center gap-2 mb-3 text-gray-700 italic">
                  <ClipboardListIcon className="w-4 h-4 text-emerald-600" />
                  <p className="font-bold text-sm">
                    Danh sách liên quan:
                  </p>
                </div>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Thu hoạch vụ lúa (Đang thực hiện)
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                    Bón phân định kỳ (Đã lên kế hoạch)
                  </li>
                </ul>
              </div>
              
              <div className="pt-2">
                <button
                  onClick={onClose}
                  className="w-full py-3 text-sm font-bold text-white bg-gray-900 rounded-xl hover:bg-gray-800 transition-all shadow-md active:scale-95"
                >
                  Tôi đã hiểu
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                <p className="text-sm text-red-800 leading-relaxed font-medium">
                  Bạn có chắc chắn muốn xóa lô đất <span className="font-bold">"{plot.name}"</span>? Dữ liệu sẽ được lưu trữ trong thùng rác và không hiển thị trên danh sách canh tác.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 text-sm font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all active:scale-95"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={() => onConfirm(plot.id)}
                  className="flex-1 py-3 text-sm font-bold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-all shadow-md active:scale-95"
                >
                  Xác nhận xóa
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
