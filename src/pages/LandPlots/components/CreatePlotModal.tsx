import React, { useState } from 'react'
import { XIcon, AlertCircleIcon } from 'lucide-react'
import { Plot } from '../../../schemas/plotSchemas'

interface CreatePlotModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (plot: any) => void
  existingPlots: Plot[]
}

export function CreatePlotModal({
  isOpen,
  onClose,
  onSave,
  existingPlots,
}: CreatePlotModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [geometryStr, setGeometryStr] = useState('[[[105.78, 21.02], [105.79, 21.02], [105.79, 21.03], [105.78, 21.03], [105.78, 21.02]]]')
  const [error, setError] = useState('')
  const [warning, setWarning] = useState('')

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setWarning('')

    // Validation
    if (!name.trim()) {
      setError('Vui lòng nhập tên lô đất')
      return
    }

    let geometry;
    try {
      const coords = JSON.parse(geometryStr);
      geometry = {
        type: 'Polygon',
        coordinates: coords
      };
    } catch (e) {
      setError('Định dạng tọa độ Geometry không hợp lệ (phải là JSON mảng 3 chiều)')
      return
    }

    // Check for duplicate names
    const isDuplicate = existingPlots.some(
      (p) => p.name.toLowerCase() === name.trim().toLowerCase(),
    )
    if (isDuplicate && !warning) {
      setWarning(
        'Tên lô đất này đã tồn tại. Bạn có chắc chắn muốn tạo? Nhấn Lưu lần nữa để xác nhận.',
      )
      return
    }

    onSave({
      plotName: name.trim(),
      description: description.trim(),
      geometry: geometry,
    })

    // Reset form
    setName('')
    setDescription('')
    setWarning('')
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 font-sans">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-5 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Tạo lô đất mới</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-lg transition-colors"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-start gap-2 border border-red-100">
              <AlertCircleIcon className="w-4 h-4 mt-0.5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {warning && (
            <div className="p-3 bg-amber-50 text-amber-800 text-sm rounded-lg flex items-start gap-2 border border-amber-200">
              <AlertCircleIcon className="w-4 h-4 mt-0.5 shrink-0" />
              <p>{warning}</p>
            </div>
          )}

          <div>
            <label
              htmlFor="name"
              className="block text-sm font-bold text-gray-700 mb-1.5 uppercase tracking-tight"
            >
              Tên lô đất <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Lô A1"
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              maxLength={100}
            />
            <p className="text-xs text-gray-500 mt-1 text-right">
              {name.length}/100
            </p>
          </div>

          <div>
            <label
              htmlFor="geometry"
              className="block text-sm font-bold text-gray-700 mb-1.5 uppercase tracking-tight"
            >
              Tọa độ Geometry (GeoJSON Coordinates) <span className="text-red-500">*</span>
            </label>
            <textarea
              id="geometry"
              value={geometryStr}
              onChange={(e) => setGeometryStr(e.target.value)}
              placeholder="VD: [[[105.7, 21.0], ...]]"
              rows={4}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none"
            />
            <p className="text-[10px] text-gray-400 mt-1">
              Định dạng mảng tọa độ GeoJSON cho Polygon.
            </p>
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-bold text-gray-700 mb-1.5 uppercase tracking-tight"
            >
              Mô tả (Tùy chọn)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nhập mô tả thêm về lô đất..."
              rows={3}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-sm font-bold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all active:scale-95"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-sm font-bold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-all shadow-md active:scale-95"
            >
              Lưu lô đất
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
