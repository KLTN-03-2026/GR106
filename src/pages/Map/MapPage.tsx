import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchPlots, createPlot, updatePlot } from '../../store/plotSlice';
import { Plot, GeoPoint, Geometry } from '../../types/plot';
import { toast } from 'sonner';

import { FarmMap } from './components/FarmMap';
import { DrawingToolbar, DrawingMode } from './components/DrawingToolbar';
import { BoundaryConfirmDialog } from './components/BoundaryConfirmDialog';
import { DeleteBoundaryDialog } from './components/DeleteBoundaryDialog';
import { CreatePlotModal } from '../LandPlots/components/CreatePlotModal';
import { isSelfIntersecting } from '../../utils/plotUtils';

export function MapPage() {
  const location = useLocation()
  const { farmId } = useParams<{ farmId: string }>()
  const dispatch = useDispatch<AppDispatch>()
  
  // Redux State
  const { plots } = useSelector((state: RootState) => state.plot)
  const [selectedPlot, setSelectedPlot] = useState<Plot | null>(null)
  
  // Drawing State
  const [mode, setMode] = useState<DrawingMode>('none')
  const [currentPath, setCurrentPath] = useState<GeoPoint[]>([])
  const [calculatedArea, setCalculatedArea] = useState(0)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  // Fetch dữ liệu khi mount
  useEffect(() => {
    if (farmId) {
      dispatch(fetchPlots(farmId))
    }
  }, [dispatch, farmId])

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
    if (!farmId) return;
    try {
      await dispatch(createPlot({ farmId, plotData })).unwrap()
      toast.success('Tạo lô đất mới thành công')
      setIsCreateModalOpen(false)
      setMode('none')
      setCurrentPath([])
      dispatch(fetchPlots(farmId))
    } catch (err: any) {
      toast.error(err.message || 'Không thể tạo lô đất')
    }
  }

  const handleConfirmSave = async () => {
    if (!farmId) return;
    setIsConfirmOpen(false)
    
    // Nếu đang chọn một lô đất cũ, thực hiện cập nhật
    if (selectedPlot && (selectedPlot.geometry || (selectedPlot.boundaries && selectedPlot.boundaries.length > 0))) {
      const geometry: Geometry = {
        type: 'Polygon',
        coordinates: [[...currentPath.map(p => [p.lng, p.lat]), [currentPath[0]?.lng, currentPath[0]?.lat]]]
      }
      
      try {
        const result = await dispatch(updatePlot({ 
          farmId,
          plotId: selectedPlot.id, 
          plotData: { 
            areaHa: calculatedArea,
            geometry 
          } 
        })).unwrap()
        
        toast.success('Cập nhật ranh giới lô đất thành công')
        setSelectedPlot(result) // Cập nhật local state với dữ liệu mới từ API
        setMode('none')
        setCurrentPath([])
        dispatch(fetchPlots(farmId))
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
    if (!farmId) return;
    setIsDeleteModalOpen(false)
    if (!selectedPlot) return

    try {
      // PB 06/07: Xóa ranh giới là update geometry về null
      const result = await dispatch(updatePlot({ 
        farmId,
        plotId: selectedPlot.id, 
        plotData: { 
          areaHa: 0,
          geometry: null 
        } 
      })).unwrap()
      
      toast.success('Đã xóa ranh giới lô đất')
      setSelectedPlot(result) // Cập nhật local state để UI (Toolbar/Map) nhận diện ranh giới đã mất
      setMode('none')
      setCurrentPath([])
      dispatch(fetchPlots(farmId))
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
