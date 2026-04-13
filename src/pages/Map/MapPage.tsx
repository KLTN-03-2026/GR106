import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '../../store'
import { fetchPlots, createPlot } from '../../store/plotSlice'
import { FarmMap } from './components/FarmMap'
import { DrawingToolbar, DrawingMode } from './components/DrawingToolbar'
import { CreatePlotModal } from '../LandPlots/components/CreatePlotModal'
import { toast } from 'sonner'
import { BoundaryConfirmDialog } from './components/BoundaryConfirmDialog'
import { DeleteBoundaryDialog } from './components/DeleteBoundaryDialog'
import { Plot, GeoPoint } from '../../types/plot'
import { isSelfIntersecting } from '../../utils/plotUtils'


export function MapPage() {
  const location = useLocation()
  const dispatch = useDispatch<AppDispatch>()
  
  // Redux State
  const { plots, loading } = useSelector((state: RootState) => state.plot)
  const [selectedPlot, setSelectedPlot] = useState<Plot | null>(null)
  
  // Drawing State
  const [mode, setMode] = useState<DrawingMode>('none')
  const [currentPath, setCurrentPath] = useState<GeoPoint[]>([])
  const [calculatedArea, setCalculatedArea] = useState(0)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  // Fetch dữ liệu nếu chưa có
  useEffect(() => {
    if (plots.length === 0 && !loading) {
      dispatch(fetchPlots())
    }
  }, [dispatch, plots.length, loading])

  // Xử lý logic từ trang LandPlots chuyển qua
  useEffect(() => {
    const state = location.state as { selectedPlotId?: string; mode?: DrawingMode }
    if (state?.selectedPlotId && plots.length > 0) {
      const plot = plots.find(p => p.id === state.selectedPlotId)
      if (plot) {
        setSelectedPlot(plot)
        if (state.mode === 'editing') {
          handleEditBoundaries(plot)
        }
      }
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
    // PB 07: Kiểm tra hợp lệ (không tự cắt)
    if (isSelfIntersecting(currentPath)) {
      toast.error('Ranh giới không hợp lệ: Đa giác không được tự cắt chính nó.')
      return
    }

    const area = computeArea(currentPath)
    setCalculatedArea(area)
    setIsConfirmOpen(true)
  }

  const handleCreatePlotFromMap = async (plotData: any) => {
    try {
      await dispatch(createPlot(plotData)).unwrap()
      toast.success('Tạo lô đất mới thành công')
      setIsCreateModalOpen(false)
      setMode('none')
      setCurrentPath([])
    } catch (err: any) {
      toast.error(err.message || 'Không thể tạo lô đất')
    }
  }

  const handleConfirmSave = async () => {
    setIsConfirmOpen(false)
    
    // Nếu đang chọn một lô đất cũ, thực hiện cập nhật
    if (selectedPlot && (selectedPlot.geometry || (selectedPlot.boundaries && selectedPlot.boundaries.length > 0))) {
      const payload = {
        ...selectedPlot,
        areaHa: calculatedArea,
        geometry: {
          type: 'Polygon',
          coordinates: [[...currentPath.map(p => [p.lng, p.lat]), [currentPath[0]?.lng, currentPath[0]?.lat]]]
        }
      }
      
      try {
        console.log('Update Plot Action Placeholder:', payload)
        // Khi có API sẽ gọi: await dispatch(updatePlot(payload)).unwrap()
        toast.info('Đã ghi nhận thay đổi ranh giới (Chờ API cập nhật)')
        setMode('none')
        setCurrentPath([])
      } catch (err: any) {
        toast.error(err.message || 'Lỗi cập nhật ranh giới')
      }
    } else {
      // Nếu là vẽ mới hoàn toàn
      setIsCreateModalOpen(true)
    }
  }

  const handleCancelDrawing = () => {
    setMode('none')
    setCurrentPath([])
  }

  const startDrawing = (plot: Plot) => {
    setSelectedPlot(plot)
    setMode('drawing')
    setCurrentPath([])
  }

  const handleEditBoundaries = (plot: Plot) => {
    setSelectedPlot(plot)
    setMode('editing')
    
    // Chuyển đổi GeoJSON sang path nếu có
    if (plot.geometry?.type === 'Polygon') {
      const path = plot.geometry.coordinates[0].map((coord: any) => ({
        lng: coord[0],
        lat: coord[1]
      }))
      // Loại bỏ điểm cuối trùng điểm đầu của GeoJSON Polygon
      path.pop() 
      setCurrentPath(path)
    } else if (plot.boundaries) {
      setCurrentPath(plot.boundaries)
    }
  }

  const handleDeleteBoundary = async () => {
    setIsDeleteModalOpen(false)
    if (!selectedPlot) return

    const payload = {
      ...selectedPlot,
      areaHa: 0,
      geometry: null
    }

    try {
      console.log('Delete Boundary Action Placeholder:', payload)
      // Khi có API: await dispatch(updatePlot(payload)).unwrap()
      toast.success('Đã xóa ranh giới lô đất')
      setMode('none')
      setCurrentPath([])
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi xóa ranh giới')
    }
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

      {/* Toolbar */}
      <DrawingToolbar
        mode={mode}
        onModeChange={setMode}
        onSave={handleSaveDrawing}
        onCancel={handleCancelDrawing}
        onDeleteClick={() => setIsDeleteModalOpen(true)}
        canSave={currentPath.length >= 3}
        hasBoundary={!!(selectedPlot?.geometry || (selectedPlot?.boundaries && selectedPlot.boundaries.length > 0))}
      />

      {/* Thông báo hướng dẫn nếu đang ở chế độ rảnh rỗi */}
      {mode === 'none' && !selectedPlot && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md px-6 py-3 rounded-2xl shadow-xl border border-white/50 text-gray-700 font-bold text-sm flex items-center gap-3 animate-bounce">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          Sử dụng thanh công cụ để vẽ lô đất mới hoặc chọn lô đất có sẵn
        </div>
      )}

      <BoundaryConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmSave}
        plotName={selectedPlot?.name || 'Lô đất mới'}
        calculatedArea={calculatedArea}
      />

      <DeleteBoundaryDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteBoundary}
        plotName={selectedPlot?.name || ''}
      />

      <CreatePlotModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreatePlotFromMap}
        existingPlots={plots}
        initialGeometry={{
          type: 'Polygon',
          coordinates: [[...currentPath.map(p => [p.lng, p.lat]), [currentPath[0]?.lng, currentPath[0]?.lat]]]
        }}
        initialAreaHa={calculatedArea}
      />
    </div>
  )
}

export default MapPage;
