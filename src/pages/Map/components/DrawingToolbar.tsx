import { CheckIcon, XIcon, InfoIcon, AlertTriangleIcon } from 'lucide-react'

export type DrawingMode = 'none' | 'drawing' | 'editing'

interface DrawingToolbarProps {
  mode: DrawingMode
  onModeChange: (mode: DrawingMode) => void
  onSave: () => void
  onCancel: () => void
  onDeleteClick: () => void
  canSave: boolean
  hasBoundary: boolean
  /** Polygon hiện tại đang chồng chéo lô khác */
  isOverlapping?: boolean
}

export function DrawingToolbar({
  mode,
  onSave,
  onCancel,
  canSave,
  isOverlapping = false,
}: DrawingToolbarProps) {
  if (mode === 'none') return null

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-xl border border-white/50 font-sans transition-all duration-300">
      {/* Trạng thái hiện tại */}
      {isOverlapping ? (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-xs font-bold border border-red-200 animate-pulse">
          <AlertTriangleIcon className="w-4 h-4" />
          Chồng chéo với lô đất khác — hãy điều chỉnh ranh giới
        </div>
      ) : (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold border border-emerald-100 animate-pulse">
          <InfoIcon className="w-4 h-4" />
          {mode === 'drawing'
            ? 'Đang vẽ: Click trên bản đồ để tạo các mốc ranh giới'
            : 'Đang sửa: Kéo các điểm mốc để thay đổi hình dạng'}
        </div>
      )}

      <div className="h-6 w-px bg-gray-200" />

      <button
        onClick={onSave}
        disabled={!canSave || isOverlapping}
        title={isOverlapping ? 'Không thể lưu khi ranh giới chồng chéo' : undefined}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all active:scale-95 shadow-md ${
          isOverlapping
            ? 'bg-red-100 text-red-400 cursor-not-allowed shadow-none'
            : canSave
            ? 'bg-emerald-600 text-white hover:bg-emerald-700'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
        }`}
      >
        <CheckIcon className="w-4 h-4" />
        Lưu ranh giới
      </button>

      <button
        onClick={onCancel}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all active:scale-95 shadow-sm"
      >
        <XIcon className="w-4 h-4" />
        Hủy
      </button>
    </div>
  )
}
