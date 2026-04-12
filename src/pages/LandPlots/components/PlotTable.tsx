import { Edit2Icon, Trash2Icon, MapIcon } from 'lucide-react'
import { Plot } from '../../../types/plot'
import { PlotStatusBadge } from './PlotStatusBadge'

interface PlotTableProps {
  plots: Plot[]
  onEdit: (plot: Plot) => void
  onDelete: (plot: Plot) => void
  onViewMap: (plot: Plot) => void
}

export function PlotTable({
  plots,
  onEdit,
  onDelete,
  onViewMap,
}: PlotTableProps) {
  if (plots.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm font-sans">
        <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <MapIcon className="w-6 h-6 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">
          Không tìm thấy lô đất nào
        </h3>
        <p className="text-gray-500">
          Thử thay đổi bộ lọc hoặc tạo lô đất mới.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden font-sans">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-gray-700 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Tên lô đất</th>
              <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Diện tích (ha)</th>
              <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Trạng thái</th>
              <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Mô tả</th>
              <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {plots.map((plot) => (
              <tr
                key={plot.id}
                className="hover:bg-emerald-50/50 transition-colors group"
              >
                <td className="px-6 py-4 font-semibold text-gray-900">
                  {plot.name}
                </td>
                <td className="px-6 py-4 font-medium">
                  {plot.areaHa.toLocaleString('vi-VN')}
                </td>
                <td className="px-6 py-4">
                  <PlotStatusBadge status={plot.status} />
                </td>
                <td
                  className="px-6 py-4 max-w-xs truncate text-gray-500"
                  title={plot.description}
                >
                  {plot.description || '-'}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onViewMap(plot)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      title="Xem trên bản đồ"
                    >
                      <MapIcon className="w-4.5 h-4.5" />
                    </button>
                    <button
                      onClick={() => onEdit(plot)}
                      className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                      title="Chỉnh sửa"
                    >
                      <Edit2Icon className="w-4.5 h-4.5" />
                    </button>
                    <button
                      onClick={() => onDelete(plot)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      title="Xóa"
                    >
                      <Trash2Icon className="w-4.5 h-4.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
