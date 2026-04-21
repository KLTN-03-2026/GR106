import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchPlots, createPlot, updatePlot } from '../../store/plotSlice';
import { Plot, GeoPoint, Geometry } from '../../types/plot';
import { toast } from 'sonner';
import { ArrowLeft, Map as MapIcon, PencilIcon, MapPinIcon } from 'lucide-react';
import { Navigate } from 'react-router-dom';

import { FarmMap } from './components/FarmMap';
import { DrawingToolbar, DrawingMode } from './components/DrawingToolbar';
import { BoundaryConfirmDialog } from './components/BoundaryConfirmDialog';
import { DeleteBoundaryDialog } from './components/DeleteBoundaryDialog';
import { CreatePlotModal } from '../LandPlots/components/CreatePlotModal';
import { isSelfIntersecting } from '../../utils/plotUtils';

export function MapPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();
  
  // Redux State — get currentFarmId instead of URL param
  const currentFarmId = useSelector((state: RootState) => state.auth.currentFarmId);
  const { plots } = useSelector((state: RootState) => state.plot);
  const [selectedPlot, setSelectedPlot] = useState<Plot | null>(null);
  
  // Drawing State
  const [mode, setMode] = useState<DrawingMode>('none');
  const [currentPath, setCurrentPath] = useState<GeoPoint[]>([]);
  const [calculatedArea, setCalculatedArea] = useState(0);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const locationState = location.state as {
    selectedPlotId?: string;
    mode?: DrawingMode;
    source?: string;
    preloadPlot?: Plot;
  } | null;
  const selectedPlotIdFromUrl = searchParams.get('plotId') ?? undefined;
  const modeFromUrl = (searchParams.get('mode') as DrawingMode | null) ?? undefined;
  const targetPlotId = selectedPlotIdFromUrl ?? locationState?.selectedPlotId;
  const targetMode = modeFromUrl ?? locationState?.mode;

  // Redirect to farm selection if no farmId
  if (!currentFarmId) {
    return <Navigate to="/farms" replace />;
  }

  // Fetch dữ liệu khi mount
  useEffect(() => {
    dispatch(fetchPlots(currentFarmId));
  }, [dispatch, currentFarmId]);

  // Xử lý logic từ trang LandPlots chuyển qua
  // Ưu tiên hiển thị ngay lô vừa click từ danh sách để UX tức thì
  useEffect(() => {
    if (locationState?.preloadPlot) {
      setSelectedPlot(locationState.preloadPlot);
      if (targetMode === 'editing') {
        handleEditBoundaries(locationState.preloadPlot);
      }
    }
  }, [locationState?.preloadPlot, targetMode]);

  // Đồng bộ lại bằng dữ liệu mới nhất từ API
  useEffect(() => {
    if (targetPlotId && plots.length > 0) {
      const plot = plots.find((p) => p.id === targetPlotId);
      if (plot) {
        setSelectedPlot(plot);
        if (targetMode === 'editing') {
          handleEditBoundaries(plot);
        } else {
          setMode('none');
          setCurrentPath([]);
        }
      }
      return;
    }

    setSelectedPlot(null);
    setMode('none');
    setCurrentPath([]);
  }, [targetPlotId, targetMode, plots]);

  // Tính diện tích tự động (m2 -> ha)
  const computeArea = (path: GeoPoint[]) => {
    if (path.length < 3) return 0;
    if (!window.google) return 0;
    
    try {
      const googlePath = path.map(p => new window.google.maps.LatLng(p.lat, p.lng));
      const areaInSqMeters = window.google.maps.geometry.spherical.computeArea(googlePath);
      return areaInSqMeters / 10000; // Chuyển đổi sang Hecta
    } catch (e) {
      console.error('Lỗi tính diện tích:', e);
      return 0;
    }
  };

  const handleSaveDrawing = () => {
    // PB 07: Kiểm tra hợp lệ (không tự cắt)
    if (isSelfIntersecting(currentPath)) {
      toast.error('Ranh giới không hợp lệ: Đa giác không được tự cắt chính nó.');
      return;
    }

    const area = computeArea(currentPath);
    setCalculatedArea(area);
    setIsConfirmOpen(true);
  };

  const handleCreatePlotFromMap = async (plotData: any) => {
    if (!currentFarmId) return;
    try {
      await dispatch(createPlot({ farmId: currentFarmId, plotData })).unwrap();
      toast.success('Tạo lô đất mới thành công');
      setIsCreateModalOpen(false);
      setMode('none');
      setCurrentPath([]);
      dispatch(fetchPlots(currentFarmId));
    } catch (err: any) {
      toast.error(err.message || 'Không thể tạo lô đất');
    }
  };

  const handleConfirmSave = async () => {
    if (!currentFarmId) return;
    setIsConfirmOpen(false);
    
    // Nếu đang chọn một lô đất cũ, thực hiện cập nhật
    if (selectedPlot && (selectedPlot.geometry || (selectedPlot.boundaries && selectedPlot.boundaries.length > 0))) {
      const geometry: Geometry = {
        type: 'Polygon',
        coordinates: [[...currentPath.map(p => [p.lng, p.lat]), [currentPath[0]?.lng, currentPath[0]?.lat]]]
      };
      
      try {
        const result = await dispatch(updatePlot({ 
          farmId: currentFarmId,
          plotId: selectedPlot.id, 
          plotData: { 
            geometry 
          } 
        })).unwrap();
        
        toast.success('Cập nhật ranh giới lô đất thành công');
        setSelectedPlot(result);
        setMode('none');
        setCurrentPath([]);
        dispatch(fetchPlots(currentFarmId));
      } catch (err: any) {
        toast.error(err.message || 'Lỗi cập nhật ranh giới');
      }
    } else {
      // Nếu là vẽ mới hoàn toàn
      setIsCreateModalOpen(true);
    }
  };

  const handleCancelDrawing = () => {
    setMode('none');
    setCurrentPath([]);
  };

  const startDrawing = (plot: Plot) => {
    setSelectedPlot(plot);
    setMode('drawing');
    setCurrentPath([]);
  };

  const handleEditBoundaries = (plot: Plot) => {
    setSelectedPlot(plot);
    setMode('editing');
    
    // Chuyển đổi GeoJSON sang path nếu có
    if (plot.geometry?.type === 'Polygon') {
      const path = plot.geometry.coordinates[0].map((coord: any) => ({
        lng: coord[0],
        lat: coord[1]
      }));
      // Loại bỏ điểm cuối trùng điểm đầu của GeoJSON Polygon
      path.pop();
      setCurrentPath(path);
    } else if (plot.boundaries) {
      setCurrentPath(plot.boundaries);
    }
  };

  const handleSelectPlot = (plot: Plot) => {
    setSelectedPlot(plot);
    if (mode !== 'none') {
      setMode('none');
      setCurrentPath([]);
    }
  };

  const handleStartDrawForPlot = (plot: Plot) => {
    setSelectedPlot(plot);
    setMode('drawing');
    setCurrentPath([]);
  };

  const handleDeleteBoundary = async () => {
    if (!currentFarmId) return;
    setIsDeleteModalOpen(false);
    if (!selectedPlot) return;

    try {
      const result = await dispatch(updatePlot({ 
        farmId: currentFarmId,
        plotId: selectedPlot.id, 
        plotData: { 
          geometry: null 
        } 
      })).unwrap();
      
      toast.success('Đã xóa ranh giới lô đất');
      setSelectedPlot(result);
      setMode('none');
      setCurrentPath([]);
      dispatch(fetchPlots(currentFarmId));
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi xóa ranh giới');
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate(`/farms/${currentFarmId}/actions`)}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-all font-bold text-xs shrink-0"
          >
            <div className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center bg-white shadow-sm hover:shadow-md transition-all">
              <ArrowLeft size={14} />
            </div>
            Quay lại
          </button>

          <div className="h-10 w-px bg-slate-200 mx-1 hidden sm:block" />

          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
              <MapIcon className="w-8 h-8" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Bản đồ nông trại</h1>
              <p className="text-gray-500 mt-0.5 font-medium text-sm">
                Trực quan hóa và quản lý không gian các khu vực canh tác
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 w-full rounded-2xl border border-gray-100 overflow-hidden relative shadow-inner m-4 mt-2">
      <div className="absolute top-4 left-4 z-20 w-80 max-h-[70%] overflow-hidden rounded-2xl border border-gray-200 bg-white/95 backdrop-blur-md shadow-xl">
        <div className="px-4 py-3 border-b border-gray-100">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Danh sách lô đất</p>
          <p className="text-sm font-semibold text-gray-900">{plots.length} lô trong trang trại</p>
        </div>
        <div className="max-h-[420px] overflow-y-auto">
          {plots.map((plot) => {
            const hasGeometry = !!plot.geometry?.coordinates?.[0]?.length;
            const isActive = selectedPlot?.id === plot.id;
            return (
              <div
                key={plot.id}
                className={`px-4 py-3 border-b border-gray-100 last:border-b-0 ${isActive ? 'bg-emerald-50/70' : 'bg-white'}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <button
                    onClick={() => handleSelectPlot(plot)}
                    className="text-left flex-1"
                  >
                    <p className="text-sm font-semibold text-gray-900 truncate">{plot.name}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {hasGeometry ? `${(plot.areaHa ?? 0).toLocaleString('vi-VN')} ha` : 'Chưa có ranh giới'}
                    </p>
                  </button>
                  <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${hasGeometry ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {hasGeometry ? 'Đã vẽ' : 'Chưa vẽ'}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => handleSelectPlot(plot)}
                    className="text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 flex items-center gap-1"
                  >
                    <MapPinIcon className="w-3 h-3" />
                    Xem vị trí
                  </button>
                  <button
                    onClick={() => (hasGeometry ? handleEditBoundaries(plot) : handleStartDrawForPlot(plot))}
                    className="text-xs px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-1"
                  >
                    <PencilIcon className="w-3 h-3" />
                    {hasGeometry ? 'Chỉnh sửa' : 'Vẽ ranh giới'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

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
    </div>
  );
}

export default MapPage;
