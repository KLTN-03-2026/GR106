import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { FarmMap } from './components/FarmMap'
import { DrawingToolbar, DrawingMode } from './components/DrawingToolbar'
import { BoundaryConfirmDialog } from './components/BoundaryConfirmDialog'
import { LandPlot, GeoPoint } from '../../types/landPlot'

// Dữ liệu Mock ban đầu theo tài liệu PB06
const INITIAL_PLOTS: LandPlot[] = [
  {
    id: '1',
    name: 'Lô A1 - Trồng lúa',
    area: 2.5,
    status: 'active',
    description: 'Khu vực đất trũng, thích hợp trồng lúa nước',
    boundaries: [
      { lat: 10.3606, lng: 106.3653 },
      { lat: 10.3606, lng: 106.3663 },
      { lat: 10.3616, lng: 106.3663 },
      { lat: 10.3616, lng: 106.3653 },
    ]
  },
  {
    id: '2',
    name: 'Lô B2 - Vườn cây ăn trái',
    area: 1.2,
    status: 'active',
    description: 'Đang trồng xoài và bưởi',
  },
  {
    id: '3',
    name: 'Lô C1 - Đất dự phòng',
    area: 3.0,
    status: 'resting',
    description: 'Đang cải tạo đất, dự kiến trồng hoa màu vào tháng sau',
  },
]

export function MapPage() {
  const location = useLocation()
  const [plots, setPlots] = useState<LandPlot[]>(INITIAL_PLOTS)
  const [selectedPlot, setSelectedPlot] = useState<LandPlot | null>(null)
  
  // Drawing State
  const [mode, setMode] = useState<DrawingMode>('none')
  const [currentPath, setCurrentPath] = useState<GeoPoint[]>([])
  const [calculatedArea, setCalculatedArea] = useState(0)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)

  // Xử lý logic từ trang LandPlots chuyển qua
  useEffect(() => {
    const state = location.state as { selectedPlotId?: string }
    if (state?.selectedPlotId) {
      const plot = plots.find(p => p.id === state.selectedPlotId)
      if (plot) setSelectedPlot(plot)
    }
  }, [location.state, plots])

  // Tính diện tích tự động (m2 -> ha)
  const computeArea = (path: GeoPoint[]) => {
    if (path.length < 3) return 0
    if (!window.google) return 0
    
    try {
      const googlePath = path.map(p => new window.google.maps.LatLng(p.lat, p.lng))
      const areaInSqMeters = window.google.maps.geometry.spherical.computeArea(googlePath)
      return areaInSqMeters / 10000 // Chuyển đổi sang Hecta
    } catch (e) {
      console.error('Lỗi tính diện tích:', e)
      return 0
    }
  }

  const handleSaveDrawing = () => {
    const area = computeArea(currentPath)
    setCalculatedArea(area)
    setIsConfirmOpen(true)
  }

  const handleConfirmSave = () => {
    if (!selectedPlot) return

    const updatedPlots = plots.map(p => 
      p.id === selectedPlot.id 
        ? { ...p, boundaries: currentPath, area: calculatedArea } 
        : p
    )
    
    setPlots(updatedPlots)
    setMode('none')
    setCurrentPath([])
    setIsConfirmOpen(false)
    
    // Tự động chọn lại lô đất để xem InfoWindow sau khi lưu
    const updated = updatedPlots.find(p => p.id === selectedPlot.id)
    if (updated) setSelectedPlot(updated)
  }

  const handleCancelDrawing = () => {
    setMode('none')
    setCurrentPath([])
  }

  const startDrawing = (plot: LandPlot) => {
    setSelectedPlot(plot)
    setMode('drawing')
    setCurrentPath([])
  }

  return (
    <div className="h-[calc(100vh-100px)] w-full rounded-2xl border border-gray-200 overflow-hidden relative shadow-inner animate-in fade-in duration-700">
      <FarmMap
        plots={plots}
        selectedPlotId={selectedPlot?.id}
        isDrawing={mode !== 'none'}
        isEditing={mode === 'editing'}
        currentPath={currentPath}
        onPathChange={setCurrentPath}
        onPlotSelect={setSelectedPlot}
        selectedPlot={selectedPlot}
        onEditBoundaries={startDrawing}
      />

      {/* Toolbar - Hiển thị khi đã chọn một lô đất */}
      {selectedPlot && (
        <DrawingToolbar
          mode={mode}
          onModeChange={setMode}
          onSave={handleSaveDrawing}
          onCancel={handleCancelDrawing}
          canSave={currentPath.length >= 3}
          hasBoundary={!!selectedPlot.boundaries && selectedPlot.boundaries.length > 0}
        />
      )}

      {/* Thông báo hướng dẫn nếu chưa chọn lô đất */}
      {!selectedPlot && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md px-6 py-3 rounded-2xl shadow-xl border border-white/50 text-gray-700 font-bold text-sm flex items-center gap-3 animate-bounce">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          Chọn một lô đất trên bản đồ hoặc danh sách để quản lý ranh giới
        </div>
      )}

      <BoundaryConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmSave}
        plotName={selectedPlot?.name || ''}
        calculatedArea={calculatedArea}
      />
    </div>
  )
}

export default MapPage;
