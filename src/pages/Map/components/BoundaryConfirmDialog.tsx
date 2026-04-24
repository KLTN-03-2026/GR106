import { CheckCircle2Icon, XIcon, AreaChartIcon, AlertTriangleIcon } from 'lucide-react'

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 font-sans animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100">

        {/* Header */}
        <div className="relative px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-xl">
              <CheckCircle2Icon className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">Xác nhận ranh giới</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Lô đất: <span className="text-gray-600 font-medium">{plotName}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-lg transition-all"
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">

          {/* Area card */}
          <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-4 border border-gray-100">
            <div className="p-2.5 bg-white rounded-xl border border-gray-100">
              <AreaChartIcon className="w-5 h-5 text-gray-500" />
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Diện tích đo được</p>
              <h3 className="text-2xl font-semibold text-gray-900 leading-none">
                {calculatedArea.toLocaleString('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                <span className="text-sm text-gray-400 font-normal ml-1">ha</span>
              </h3>
            </div>
          </div>

          {/* Warning note */}
          <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
            <AlertTriangleIcon className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 leading-relaxed">
              Ranh giới cũ sẽ bị thay thế bằng ranh giới vừa vẽ. Vui lòng kiểm tra lại diện tích trước khi xác nhận.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all active:scale-95"
            >
              Hủy bỏ
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-xl hover:bg-gray-800 transition-all active:scale-95"
            >
              Lưu thay đổi
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}