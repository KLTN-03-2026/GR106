import { AlertTriangleIcon, Trash2Icon, XIcon } from 'lucide-react'

interface DeleteBoundaryDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  plotName: string
}

export function DeleteBoundaryDialog({
  isOpen,
  onClose,
  onConfirm,
  plotName,
}: DeleteBoundaryDialogProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 font-sans animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-500 border border-white/20">
        <div className="relative h-32 bg-red-600 flex items-center justify-center overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <div className="absolute top-4 left-4 w-12 h-12 rounded-full bg-white"></div>
            <div className="absolute top-10 right-10 w-24 h-24 rounded-full bg-white scale-150"></div>
            <div className="absolute -bottom-10 left-1/2 w-32 h-32 rounded-full bg-white"></div>
          </div>
          
          <div className="relative p-4 bg-white/20 backdrop-blur-md rounded-full shadow-inner border border-white/30 animate-pulse">
            <AlertTriangleIcon className="w-12 h-12 text-white" />
          </div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-xl transition-all"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Xóa ranh giới?</h2>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Lô đất: <span className="text-red-600 font-black">{plotName}</span></p>
          </div>

          <div className="bg-red-50 p-6 rounded-2xl border border-red-100 flex items-start gap-4">
            <div className="p-2 bg-white rounded-xl text-red-600 shadow-sm border border-red-50 shrink-0">
              <Trash2Icon className="w-6 h-6" />
            </div>
            <p className="text-sm text-red-800 font-medium leading-relaxed">
              Bạn có chắc chắn muốn xóa ranh giới của lô đất này? Thao tác này sẽ xóa toàn bộ các điểm đã vẽ và không thể hoàn tác.
            </p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 py-4 text-sm font-black text-gray-700 bg-white border-2 border-gray-100 rounded-2xl hover:bg-gray-50 hover:border-gray-200 transition-all active:scale-95 shadow-sm"
            >
              Hủy bỏ
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-4 text-sm font-black text-white bg-red-600 rounded-2xl hover:bg-red-700 transition-all shadow-xl active:scale-95 border-b-4 border-red-800"
            >
              Xác nhận xóa
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
