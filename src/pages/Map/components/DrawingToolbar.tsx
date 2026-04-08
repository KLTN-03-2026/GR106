import { MousePointer2Icon, PencilIcon, Trash2Icon, CheckIcon, XIcon, InfoIcon } from 'lucide-react'

export type DrawingMode = 'none' | 'drawing' | 'editing'

interface DrawingToolbarProps {
  mode: DrawingMode
  onModeChange: (mode: DrawingMode) => void
  onSave: () => void
  onCancel: () => void
  canSave: boolean
  hasBoundary: boolean
}

export function DrawingToolbar({
  mode,
  onModeChange,
  onSave,
  onCancel,
  canSave,
  hasBoundary,
}: DrawingToolbarProps) {
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-xl border border-white/50 font-sans transition-all duration-500">
      {mode === 'none' ? (
        <>
          <button
            onClick={() => onModeChange('drawing')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all active:scale-95 ${
              hasBoundary 
                ? 'text-gray-400 cursor-not-allowed opacity-50' 
                : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md'
            }`}
            disabled={hasBoundary}
          >
            <PencilIcon className="w-4 h-4" />
            Vẽ ranh giới mới
          </button>
          
          {hasBoundary && (
            <button
              onClick={() => onModeChange('editing')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-md active:scale-95"
            >
              <MousePointer2Icon className="w-4 h-4" />
              Chỉnh sửa ranh giới
            </button>
          )}

          {hasBoundary && (
            <button
              onClick={() => {
                if (window.confirm('Bạn có chắc chắn muốn xóa ranh giới này?')) {
                  onSave() // Logic xóa ranh giới sẽ được xử lý qua onSave với mảng rỗng
                }
              }}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-bold hover:bg-red-100 transition-all active:scale-95 border border-red-100"
            >
              <Trash2Icon className="w-4 h-4" />
              Xóa
            </button>
          )}
        </>
      ) : (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold border border-emerald-100 animate-pulse">
            <InfoIcon className="w-4 h-4" />
            {mode === 'drawing' ? 'Đang vẽ: Click trên bản đồ để tạo các mốc ranh giới' : 'Đang sửa: Kéo các điểm mốc để thay đổi hình dạng'}
          </div>
          
          <div className="h-6 w-px bg-gray-200"></div>

          <button
            onClick={onSave}
            disabled={!canSave}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all active:scale-95 shadow-md ${
              canSave 
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
      )}
    </div>
  )
}
