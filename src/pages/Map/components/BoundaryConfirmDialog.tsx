import { InfoIcon, CheckCircle2Icon, XIcon, AreaChartIcon } from 'lucide-react'

interface BoundaryConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  plotName: string
  calculatedArea: number
}

export function BoundaryConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  plotName,
  calculatedArea,
}: BoundaryConfirmDialogProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 font-sans animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-500 border border-white/20">
        <div className="relative h-32 bg-emerald-600 flex items-center justify-center overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <div className="absolute top-4 left-4 w-12 h-12 rounded-full bg-white"></div>
            <div className="absolute top-10 right-10 w-24 h-24 rounded-full bg-white scale-150"></div>
            <div className="absolute -bottom-10 left-1/2 w-32 h-32 rounded-full bg-white"></div>
          </div>
          
          <div className="relative p-4 bg-white/20 backdrop-blur-md rounded-full shadow-inner border border-white/30 animate-bounce-slow">
            <CheckCircle2Icon className="w-12 h-12 text-white" />
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
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Xác nhận ranh giới</h2>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Lô đất: <span className="text-emerald-600 font-black">{plotName}</span></p>
          </div>

          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 shadow-inner group hover:shadow-emerald-100 transition-all duration-500">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-white rounded-2xl text-emerald-600 shadow-md border border-gray-100 group-hover:rotate-12 transition-transform duration-500">
                <AreaChartIcon className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-tighter">Diện tích đo được</p>
                <h3 className="text-3xl font-black text-emerald-700 tracking-tighter">
                  {calculatedArea.toLocaleString('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  <span className="text-emerald-500 text-lg ml-1">ha</span>
                </h3>
              </div>
            </div>
          </div>

          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-start gap-4 shadow-sm">
            <div className="p-2 bg-white rounded-xl text-emerald-600 shadow-sm border border-emerald-50">
              <InfoIcon className="w-5 h-5" />
            </div>
            <p className="text-sm text-emerald-800 font-medium leading-relaxed">
              Dữ liệu ranh giới sẽ được lưu dưới dạng GeoJSON và cập nhật trực tiếp vào hồ sơ lô đất.
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
              className="flex-1 py-4 text-sm font-black text-white bg-emerald-600 rounded-2xl hover:bg-emerald-700 transition-all shadow-xl active:scale-95 border-b-4 border-emerald-800"
            >
              Lưu thay đổi
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
