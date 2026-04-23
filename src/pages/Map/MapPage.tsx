import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchPlots, createPlot, updatePlot, deletePlot } from '../../store/plotSlice';
import { fetchWarehouses } from '../../store/warehouseSlice';
import { Plot, GeoPoint, Geometry } from '../../types/plot';
import { Warehouse } from '../../types/warehouse';
import { toast } from 'sonner';
import { ArrowLeft, Map as MapIcon, PencilIcon, MapPinIcon, MousePointer2Icon, Trash2Icon } from 'lucide-react';
import { Navigate } from 'react-router-dom';

import { FarmMap, FarmMapHandle } from './components/FarmMap';
import { DrawingToolbar, DrawingMode } from './components/DrawingToolbar';
import { BoundaryConfirmDialog } from './components/BoundaryConfirmDialog';
import { DeleteBoundaryDialog } from './components/DeleteBoundaryDialog';
import { CreatePlotModal } from '../LandPlots/components/CreatePlotModal';
import { EditPlotModal } from '../LandPlots/components/EditPlotModal';
import { isSelfIntersecting, polygonsOverlap, getPlotPath } from '../../utils/plotUtils';

export function MapPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();

  // Redux State — get currentFarmId instead of URL param
  const currentFarmId = useSelector((state: RootState) => state.auth.currentFarmId);
  const { plots } = useSelector((state: RootState) => state.plot);
  const { warehouses } = useSelector((state: RootState) => state.warehouse);
  const [selectedPlot, setSelectedPlot] = useState<Plot | null>(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);

  // Drawing State
  const [mode, setMode] = useState<DrawingMode>('none');
  const [currentPath, setCurrentPath] = useState<GeoPoint[]>([]);
  const [calculatedArea, setCalculatedArea] = useState(0);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingPlot, setEditingPlot] = useState<Plot | null>(null);
  const [isDeletePlotConfirmOpen, setIsDeletePlotConfirmOpen] = useState(false);
  const [plotToDelete, setPlotToDelete] = useState<Plot | null>(null);
  // Overlap detection — lưu tên lô đang bị chồng chéo (null = không có)
  const [overlappingPlotName, setOverlappingPlotName] = useState<string | null>(null);
  const [sidebarTab, setSidebarTab] = useState<'plots' | 'warehouses'>('plots');
  // Ref tới FarmMap để đọc path khi đang chỉnh sửa
  const farmMapRef = useRef<FarmMapHandle>(null);
  // Lưu path sẽ được lưu (đọc từ ref khi editing, từ state khi drawing)
  const pathToSaveRef = useRef<GeoPoint[]>([]);
  const locationState = location.state as {
    selectedPlotId?: string;
    selectedWarehouseId?: string;
    mode?: DrawingMode;
    source?: string;
    preloadPlot?: Plot;
    preloadWarehouse?: Warehouse;
  } | null;
  const selectedPlotIdFromUrl = searchParams.get('plotId') ?? undefined;
  const selectedWarehouseIdFromUrl = searchParams.get('warehouseId') ?? undefined;
  const modeFromUrl = (searchParams.get('mode') as DrawingMode | null) ?? undefined;
  const targetPlotId = selectedPlotIdFromUrl ?? locationState?.selectedPlotId;
  const targetWarehouseId = selectedWarehouseIdFromUrl ?? locationState?.selectedWarehouseId;
  const targetMode = modeFromUrl ?? locationState?.mode;

  // Redirect to farm selection if no farmId
  if (!currentFarmId) {
    return <Navigate to="/farms" replace />;
  }

  // Fetch dữ liệu khi mount
  useEffect(() => {
    dispatch(fetchPlots(currentFarmId));
    dispatch(fetchWarehouses(currentFarmId));
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
    if (locationState?.preloadWarehouse) {
      setSelectedWarehouse(locationState.preloadWarehouse);
    }
  }, [locationState?.preloadPlot, locationState?.preloadWarehouse, targetMode]);

  // Đồng bộ lại bằng dữ liệu mới nhất từ API
  useEffect(() => {
    if (targetPlotId && plots.length > 0) {
      const plot = plots.find((p) => p.id === targetPlotId);
      if (plot) {
        setSelectedPlot(plot);
        setSelectedWarehouse(null);
        if (targetMode === 'editing') {
          handleEditBoundaries(plot);
        } else {
          setMode('none');
          setCurrentPath([]);
        }
      }
      return;
    }

    if (targetWarehouseId && warehouses.length > 0) {
      const wh = warehouses.find(w => w.id === targetWarehouseId);
      if (wh) {
        setSelectedWarehouse(wh);
        setSelectedPlot(null);
        setSidebarTab('warehouses');
        setMode('none');
        setCurrentPath([]);
      }
      return;
    }

    setSelectedPlot(null);
    setSelectedWarehouse(null);
    setMode('none');
    setCurrentPath([]);
  }, [targetPlotId, targetWarehouseId, targetMode, plots, warehouses]);

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
    // Lấy path: editing mode đọc từ Google Maps ref, drawing mode đọc từ state
    const path =
      mode === 'editing' && farmMapRef.current
        ? farmMapRef.current.getEditedPath()
        : currentPath;

    if (path.length < 3) {
      toast.error('Cần ít nhất 3 điểm để tạo ranh giới.');
      return;
    }

    // Kiểm tra tự cắt
    if (isSelfIntersecting(path)) {
      toast.error('Ranh giới không hợp lệ. Ranh giới không được cắt nhau');
      return;
    }

    // Kiểm tra chồng chéo với lô khác (double-check tại thời điểm lưu)
    const otherPlots = plots.filter((p) => p.id !== selectedPlot?.id);
    const hasOverlap = otherPlots.some((p) => {
      const otherPath = getPlotPath(p);
      return polygonsOverlap(path, otherPath);
    });
    if (hasOverlap) {
      toast.error('Ranh giới đang chồng chéo với lô đất khác. Vui lòng điều chỉnh lại.');
      return;
    }

    // Lưu path vào ref để handleConfirmSave dùng
    pathToSaveRef.current = path;
    if (mode === 'editing') setCurrentPath(path); // đồng bộ state

    const area = computeArea(path);
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

    // Dùng path đã được validate và lưu trong ref
    const path = pathToSaveRef.current.length > 0 ? pathToSaveRef.current : currentPath;

    if (selectedPlot) {
      // Cập nhật ranh giới lô đất đã có
      const geometry: Geometry = {
        type: 'Polygon',
        coordinates: [[...path.map((p) => [p.lng, p.lat]), [path[0]?.lng, path[0]?.lat]]],
      };
      const isClearDescription =
        selectedPlot.description != null && selectedPlot.description.trim() === '';

      try {
        const result = await dispatch(
          updatePlot({
            farmId: currentFarmId,
            plotId: selectedPlot.id,
            plotData: {
              name: selectedPlot.name,
              status: selectedPlot.status,
              geometry,
              ...(isClearDescription
                ? { isClearDescription: true }
                : { description: selectedPlot.description }),
            },
          })
        ).unwrap();

        toast.success('Cập nhật ranh giới lô đất thành công');
        setSelectedPlot(result);
        setMode('none');
        setCurrentPath([]);
        setOverlappingPlotName(null);
        pathToSaveRef.current = [];
        dispatch(fetchPlots(currentFarmId));
      } catch (err: any) {
        toast.error(err.message || 'Lỗi cập nhật ranh giới');
      }
    } else {
      // Vẽ mới hoàn toàn — mở modal nhập tên
      setIsCreateModalOpen(true);
    }
  };

  const handleCancelDrawing = () => {
    setMode('none');
    setCurrentPath([]);
    setOverlappingPlotName(null);
    pathToSaveRef.current = [];
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

  const handleSelectPlot = (plot: Plot | null) => {
    setSelectedPlot(plot);
    setSelectedWarehouse(null);
    
    // Cập nhật URL
    if (plot) {
      setSearchParams({ plotId: plot.id });
    } else {
      setSearchParams({});
    }

    if (mode !== 'none') {
      setMode('none');
      setCurrentPath([]);
    }
  };

  const handleSelectWarehouse = (wh: Warehouse | null) => {
    setSelectedWarehouse(wh);
    setSelectedPlot(null);
    
    // Cập nhật URL
    if (wh) {
      setSearchParams({ warehouseId: wh.id });
    } else {
      setSearchParams({});
    }

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
          isClearGeometry: true
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

  const handleDeletePlotClick = (plot: Plot) => {
    setPlotToDelete(plot);
    setIsDeletePlotConfirmOpen(true);
  };

  const handleConfirmDeletePlot = async () => {
    if (!currentFarmId || !plotToDelete) return;
    setIsDeletePlotConfirmOpen(false);
    try {
      await dispatch(deletePlot({ farmId: currentFarmId, plotId: plotToDelete.id })).unwrap();
      toast.success(`Đã xóa lô đất "${plotToDelete.name}"`);
      if (selectedPlot?.id === plotToDelete.id) {
        setSelectedPlot(null);
        setMode('none');
        setCurrentPath([]);
      }
      setPlotToDelete(null);
      dispatch(fetchPlots(currentFarmId));
    } catch (err: any) {
      toast.error(err.message || 'Không thể xóa lô đất');
    }
  };

  const handleUpdatePlotInfo = async (updatedPlot: Plot) => {
    if (!currentFarmId) return;
    try {
      const isClearDescription =
        updatedPlot.description != null && updatedPlot.description.trim() === '';

      const result = await dispatch(
        updatePlot({
          farmId: currentFarmId,
          plotId: updatedPlot.id,
          plotData: {
            name: updatedPlot.name,
            status: updatedPlot.status,
            ...(isClearDescription
              ? { isClearDescription: true }
              : { description: updatedPlot.description }),
          },
        }),
      ).unwrap();

      toast.success('Cập nhật thông tin lô đất thành công');
      setEditingPlot(null);
      setSelectedPlot(result);
      dispatch(fetchPlots(currentFarmId));
    } catch (err: any) {
      toast.error(err.message || 'Không thể cập nhật thông tin lô đất');
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
        <div className="absolute top-4 left-4 z-20 w-80 flex flex-col rounded-2xl border border-gray-200 bg-white/95 backdrop-blur-md shadow-xl" style={{ maxHeight: 'calc(100% - 2rem)' }}>
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100 shrink-0">
            <div className="flex bg-gray-100 p-1 rounded-xl mb-3">
              <button
                onClick={() => setSidebarTab('plots')}
                className={`flex-1 py-1.5 text-[11px] font-black uppercase tracking-wider rounded-lg transition-all ${
                  sidebarTab === 'plots' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Lô đất ({plots.length})
              </button>
              <button
                onClick={() => setSidebarTab('warehouses')}
                className={`flex-1 py-1.5 text-[11px] font-black uppercase tracking-wider rounded-lg transition-all ${
                  sidebarTab === 'warehouses' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Kho hàng ({warehouses.length})
              </button>
            </div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">
              {sidebarTab === 'plots' ? 'Danh sách khu vực canh tác' : 'Danh sách hạ tầng lưu trữ'}
            </p>
          </div>
          {/* Scrollable list */}
          <div className="overflow-y-auto flex-1 min-h-0">
            {sidebarTab === 'plots' ? (
              plots.length === 0 ? (
                <div className="px-4 py-10 text-center flex flex-col items-center gap-3">
                  <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center">
                    <MapIcon className="w-6 h-6 text-gray-300" />
                  </div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Chưa có lô đất nào</p>
                </div>
              ) : (
                plots.map((plot) => {
                  const hasGeometry = !!plot.geometry?.coordinates?.[0]?.length;
                  const isActive = selectedPlot?.id === plot.id;
                  return (
                    <div
                      key={plot.id}
                      className={`px-4 py-4 border-b border-gray-50 last:border-b-0 transition-all ${
                        isActive ? 'bg-emerald-50/80 border-l-4 border-l-emerald-500' : 'bg-white hover:bg-gray-50/50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <button
                          onClick={() => handleSelectPlot(plot)}
                          className="text-left flex-1 min-w-0"
                        >
                          <p className={`text-sm font-bold truncate ${isActive ? 'text-emerald-900' : 'text-gray-900'}`}>{plot.name}</p>
                          <p className="text-[11px] text-gray-500 mt-1 font-medium">
                            {hasGeometry ? `${(plot.areaHa ?? 0).toLocaleString('vi-VN')} ha` : 'Chưa có ranh giới'}
                          </p>
                        </button>
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-tighter shrink-0 ${
                          hasGeometry ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {hasGeometry ? 'Đã vẽ' : 'Chưa vẽ'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                        <button
                          onClick={() => handleSelectPlot(plot)}
                          className="text-[10px] font-bold px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 transition-colors"
                        >
                          <MapPinIcon className="w-3 h-3" />
                          Vị trí
                        </button>

                        {hasGeometry ? (
                          <button
                            onClick={() => handleEditBoundaries(plot)}
                            className="text-[10px] font-bold px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-1.5 transition-colors"
                          >
                            <MousePointer2Icon className="w-3 h-3" />
                            Sửa ranh giới
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStartDrawForPlot(plot)}
                            className="text-[10px] font-bold px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-1.5 transition-colors"
                          >
                            <PencilIcon className="w-3 h-3" />
                            Vẽ mới
                          </button>
                        )}

                        <button
                          onClick={() => setEditingPlot(plot)}
                          className="text-[10px] font-bold px-2.5 py-1.5 rounded-lg border border-emerald-200 text-emerald-700 hover:bg-emerald-50 flex items-center gap-1.5 transition-colors"
                        >
                          <PencilIcon className="w-3 h-3" />
                          Sửa
                        </button>

                        <button
                          onClick={() => handleDeletePlotClick(plot)}
                          className="text-[10px] font-bold px-2.5 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 flex items-center gap-1.5 transition-colors ml-auto"
                        >
                          <Trash2Icon className="w-3 h-3" />
                          Xóa
                        </button>
                      </div>
                    </div>
                  );
                })
              )
            ) : (
              warehouses.length === 0 ? (
                <div className="px-4 py-10 text-center flex flex-col items-center gap-3">
                  <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center">
                    <MapIcon className="w-6 h-6 text-gray-300" />
                  </div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Chưa có kho hàng nào</p>
                </div>
              ) : (
                warehouses.map((wh) => {
                  const isActive = selectedWarehouse?.id === wh.id;
                  return (
                    <div
                      key={wh.id}
                      className={`px-4 py-4 border-b border-gray-50 last:border-b-0 transition-all ${
                        isActive ? 'bg-blue-50/80 border-l-4 border-l-blue-500' : 'bg-white hover:bg-gray-50/50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <button
                          onClick={() => handleSelectWarehouse(wh)}
                          className="text-left flex-1 min-w-0"
                        >
                          <p className={`text-sm font-bold truncate ${isActive ? 'text-blue-900' : 'text-gray-900'}`}>{wh.name}</p>
                          <p className="text-[11px] text-gray-500 mt-1 font-medium line-clamp-1">
                            {wh.address || 'Chưa có địa chỉ'}
                          </p>
                        </button>
                        <div className="p-1.5 bg-blue-100 rounded-lg text-blue-600 shrink-0 shadow-sm">
                           <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-warehouse"><path d="M22 22H2"/><path d="M6 22V10l6-6 6 6v12"/><path d="M10 22v-4a2 2 0 0 1 4 0v4"/><path d="M2 10l10-8 10 8"/></svg>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 mt-3">
                        <button
                          onClick={() => handleSelectWarehouse(wh)}
                          className="text-[10px] font-bold px-2.5 py-1.5 rounded-lg border border-blue-200 text-blue-700 hover:bg-blue-50 flex items-center gap-1.5 transition-colors w-full justify-center"
                        >
                          <MapPinIcon className="w-3 h-3" />
                          Xem vị trí kho
                        </button>
                      </div>
                    </div>
                  );
                })
              )
            )}
          </div>
        </div>

        <FarmMap
          ref={farmMapRef}
          plots={plots}
          selectedPlotId={selectedPlot?.id}
          isDrawing={mode !== 'none'}
          isEditing={mode === 'editing'}
          currentPath={currentPath}
          onPathChange={setCurrentPath}
          onPlotSelect={handleSelectPlot}
          selectedPlot={selectedPlot}
          onEditBoundaries={startDrawing}
          onOverlapChange={setOverlappingPlotName}
          warehouses={warehouses}
          selectedWarehouseId={selectedWarehouse?.id}
          onWarehouseSelect={handleSelectWarehouse}
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
          overlappingPlotName={overlappingPlotName}
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

        {/* Dialog xác nhận xóa lô đất */}
        {isDeletePlotConfirmOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-[360px] mx-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 bg-red-100 rounded-xl">
                  <Trash2Icon className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="text-base font-bold text-gray-900">Xóa lô đất</h3>
              </div>
              <p className="text-sm text-gray-600 mb-5">
                Bạn có chắc muốn xóa lô đất <span className="font-semibold text-gray-900">"{plotToDelete?.name}"</span>? Hành động này không thể hoàn tác.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => { setIsDeletePlotConfirmOpen(false); setPlotToDelete(null); }}
                  className="px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleConfirmDeletePlot}
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors"
                >
                  Xóa lô đất
                </button>
              </div>
            </div>
          </div>
        )}

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

        <EditPlotModal
          isOpen={!!editingPlot}
          onClose={() => setEditingPlot(null)}
          onSave={handleUpdatePlotInfo}
          plot={editingPlot}
        />
      </div>
    </div>
  );
}

export default MapPage;
