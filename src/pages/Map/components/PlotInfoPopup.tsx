import { LandPlot } from '../../../types/landPlot'
import { PlotStatusBadge } from '../../LandPlots/components/PlotStatusBadge'
import { MaximizeIcon, InfoIcon, ChevronRightIcon } from 'lucide-react'

interface PlotInfoPopupProps {
  plot: LandPlot
  onClose: () => void
  onEditBoundaries: (plot: LandPlot) => void
}

export function PlotInfoPopup({
  plot,
  onClose,
  onEditBoundaries,
}: PlotInfoPopupProps) {
  return (
    <div className="bg-white rounded-3xl shadow-2xl p-6 min-w-[280px] max-w-sm border border-gray-100 font-sans transition-all duration-700 animate-in fade-in zoom-in-95">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600 shadow-inner border border-emerald-100 shrink-0">
          <InfoIcon className="w-6 h-6 animate-pulse" />
        </div>
        <button
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all active:scale-90"
        >
          <ChevronRightIcon className="w-5 h-5 rotate-90" />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-black text-gray-900 tracking-tight leading-tight">
            {plot.name}
          </h3>
          <div className="mt-2">
            <PlotStatusBadge status={plot.status} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
              Diện tích
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-black text-emerald-700 leading-none">
                {plot.area.toLocaleString('vi-VN')}
              </span>
              <span className="text-[10px] font-bold text-emerald-500">ha</span>
            </div>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
              Mốc ranh giới
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-black text-emerald-700 leading-none">
                {plot.boundaries?.length || 0}
              </span>
              <span className="text-[10px] font-bold text-emerald-500">điểm</span>
            </div>
          </div>
        </div>

        {plot.description && (
          <div className="p-3 bg-blue-50/50 rounded-2xl border border-blue-100/50">
            <p className="text-xs text-blue-700 font-medium leading-relaxed italic line-clamp-2">
              "{plot.description}"
            </p>
          </div>
        )}

        <button
          onClick={() => onEditBoundaries(plot)}
          className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 text-white text-sm font-black rounded-2xl hover:bg-emerald-700 transition-all shadow-xl active:scale-95 border-b-4 border-emerald-800"
        >
          <MaximizeIcon className="w-4 h-4" />
          Cập nhật ranh giới
        </button>
      </div>
    </div>
  )
}
