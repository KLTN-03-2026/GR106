import { useCallback, useRef, useState, useMemo, useEffect } from 'react'
import { GoogleMap, DrawingManager, InfoWindow } from '@react-google-maps/api'
import { Geometry, Plot } from '../../../types/plot'
import { useGoogleMaps } from '../../../providers/GoogleMapsProvider'
import { PlotInfoPopup } from '../../../pages/Map/components/PlotInfoPopup'

interface PlotDrawingMapProps {
  onGeometryChange: (geometry: Geometry | null, areaHa: number) => void;
  initialGeometry?: Geometry | null;
  tempPlotData?: Partial<Plot>; // Dữ liệu tạm thời để hiển thị trong Popup
}

const MAP_OPTIONS: google.maps.MapOptions = {
  mapTypeId: 'roadmap',
  tilt: 0,
  mapTypeControl: false,
  streetViewControl: false,
  rotateControl: false,
  fullscreenControl: false,
}

export function PlotDrawingMap({ onGeometryChange, initialGeometry, tempPlotData }: PlotDrawingMapProps) {
  const { isLoaded } = useGoogleMaps()

  const [pointCount, setPointCount] = useState(0)
  const [area, setArea] = useState(0)
  const [currentPolygon, setCurrentPolygon] = useState<google.maps.Polygon | null>(null)
  const [isDrawingApiReady, setIsDrawingApiReady] = useState(false)
  const [drawingMode, setDrawingMode] = useState<google.maps.drawing.OverlayType | null>(null)
  const [showPopup, setShowPopup] = useState(false)
  const mapRef = useRef<google.maps.Map | null>(null)

  // Kiểm tra sự tồn tại của thư viện drawing
  useEffect(() => {
    if (isLoaded && window.google?.maps?.drawing) {
      setIsDrawingApiReady(true)
    }
  }, [isLoaded])

  const center = useMemo(() => {
    // Nếu có geometry ban đầu, lấy tọa độ đầu tiên làm tâm
    if (initialGeometry?.coordinates?.[0]?.[0]) {
      return {
        lng: initialGeometry.coordinates[0][0][0],
        lat: initialGeometry.coordinates[0][0][1],
      }
    }
    // Vị trí mặc định (Tiền Giang)
    return { lat: 10.3606, lng: 106.3653 }
  }, [initialGeometry])

  const calculateStats = useCallback((path: google.maps.MVCArray<google.maps.LatLng>) => {
    const count = path.getLength()
    setPointCount(count)
    
    if (count >= 3 && window.google?.maps?.geometry) {
      const areaInSqMeters = google.maps.geometry.spherical.computeArea(path)
      setArea(areaInSqMeters / 10000) // Chuyển sang ha
    } else {
      setArea(0)
    }
  }, [])

  const onPolygonComplete = useCallback((poly: google.maps.Polygon) => {
    // Xóa polygon cũ nếu có (chỉ cho phép vẽ 1 vùng tại một thời điểm trong form tạo)
    if (currentPolygon) {
      currentPolygon.setMap(null)
    }

    // Kết thúc chế độ vẽ sau khi xong 1 vùng
    setDrawingMode(null)

    const path = poly.getPath()
    const coords: number[][] = []
    
    for (let i = 0; i < path.getLength(); i++) {
      const pt = path.getAt(i)
      coords.push([pt.lng(), pt.lat()])
    }
    
    // GeoJSON Polygon phải khép kín (điểm cuối trùng điểm đầu)
    if (coords.length > 0) {
      coords.push([...coords[0]])
    }

    const geometry: Geometry = {
      type: 'Polygon',
      coordinates: [coords]
    }

    setCurrentPolygon(poly)
    const areaInSqMeters = window.google.maps.geometry.spherical.computeArea(path)
    const areaHa = areaInSqMeters / 10000
    onGeometryChange(geometry, areaHa)
    calculateStats(path)
    setShowPopup(true)

    // Lắng nghe sự kiện thay đổi (edit/drag) nếu enabled
    google.maps.event.addListener(path, 'set_at', () => {
      const newPath = poly.getPath()
      updateGeometry(newPath)
      calculateStats(newPath)
    })
    google.maps.event.addListener(path, 'insert_at', () => {
      const newPath = poly.getPath()
      updateGeometry(newPath)
      calculateStats(newPath)
    })
    google.maps.event.addListener(path, 'remove_at', () => {
      const newPath = poly.getPath()
      updateGeometry(newPath)
      calculateStats(newPath)
    })
  }, [currentPolygon, onGeometryChange, calculateStats])

  const handleClear = () => {
    if (currentPolygon) {
      currentPolygon.setMap(null)
      setCurrentPolygon(null)
    }
    setPointCount(0)
    setArea(0)
    setShowPopup(false)
    onGeometryChange(null, 0)
    setDrawingMode(null)
  }

  const updateGeometry = (path: google.maps.MVCArray<google.maps.LatLng>) => {
    const coords: number[][] = []
    for (let i = 0; i < path.getLength(); i++) {
      const pt = path.getAt(i)
      coords.push([pt.lng(), pt.lat()])
    }
    if (coords.length > 0) {
      coords.push([...coords[0]])
    }
    const areaInSqMeters = window.google.maps.geometry.spherical.computeArea(path)
    const areaHa = areaInSqMeters / 10000
    onGeometryChange({
      type: 'Polygon',
      coordinates: [coords]
    }, areaHa)
  }

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map
  }, [])

  if (!isLoaded) return (
    <div className="w-full h-[300px] bg-gray-50 flex items-center justify-center rounded-xl border border-dashed border-gray-300">
      <div className="text-gray-400 text-xs animate-pulse">Đang tải bản đồ...</div>
    </div>
  )

  return (
    <div className="w-full h-[400px] flex flex-col gap-3">
      {/* Custom Toolbar */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            if (isDrawingApiReady) {
              setDrawingMode(window.google.maps.drawing.OverlayType.POLYGON)
            }
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border transition-all font-medium text-sm ${
            drawingMode === 'polygon' 
              ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-200 animate-pulse' 
              : 'bg-white border-gray-200 text-gray-700 hover:border-emerald-500 hover:text-emerald-600'
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
          {drawingMode === 'polygon' ? 'Đang vẽ (Nhấp trên map)' : 'Vẽ polygon'}
        </button>
        
        <button
          type="button"
          onClick={handleClear}
          className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-all font-medium text-sm flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Xóa
        </button>
      </div>

      <div className="flex-1 rounded-xl overflow-hidden border border-gray-200 shadow-sm relative group">
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '100%' }}
          center={center}
          zoom={16}
          onLoad={onLoad}
          options={MAP_OPTIONS}
        >
          {isDrawingApiReady && (
            <DrawingManager
              onPolygonComplete={onPolygonComplete}
              drawingMode={drawingMode}
              options={{
                drawingControl: false, // Ẩn thanh công cụ mặc định
                polygonOptions: {
                  fillColor: '#10b981',
                  fillOpacity: 0.3,
                  strokeColor: '#059669',
                  strokeWeight: 2,
                  editable: true,
                  draggable: true,
                  zIndex: 1,
                },
              }}
            />
          )}

          {/* Hiển thị InfoWindow sau khi vẽ xong */}
          {showPopup && currentPolygon && (
            <InfoWindow
              position={currentPolygon.getPath().getAt(0)}
              onCloseClick={() => setShowPopup(false)}
            >
              <PlotInfoPopup
                plot={{
                  id: 'temp',
                  name: tempPlotData?.name || 'Lô đất mới',
                  areaHa: area,
                  status: tempPlotData?.status || 'ACTIVE',
                  description: tempPlotData?.description,
                  boundaries: currentPolygon.getPath().getArray().map((p: google.maps.LatLng) => ({ lat: p.lat(), lng: p.lng() }))
                }}
                onClose={() => setShowPopup(false)}
                onEditBoundaries={() => {
                  setShowPopup(false)
                  setDrawingMode(window.google.maps.drawing.OverlayType.POLYGON)
                }}
              />
            </InfoWindow>
          )}
        </GoogleMap>
        
        {/* Overlay Thông báo */}
        {drawingMode === 'polygon' && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
            <div className="bg-emerald-600 text-white px-4 py-1.5 rounded-full shadow-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 animate-bounce">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
              Bắt đầu nhấp trên bản đồ để vẽ
            </div>
          </div>
        )}

        {/* Thông tin tọa độ & diện tích (Box thống kê) */}
        {(pointCount > 0 || area > 0) && (
          <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-2">
            <div className="bg-white/90 backdrop-blur-md px-4 py-3 rounded-2xl shadow-2xl border border-emerald-100 flex flex-col gap-2 min-w-[140px]">
              <div className="flex items-center justify-between">
                 <span className="text-[10px] font-bold text-gray-400 uppercase">Điểm đã vẽ</span>
                 <span className="text-sm font-black text-emerald-600">{pointCount}</span>
              </div>
              <div className="h-px bg-gray-100" />
              <div className="flex flex-col">
                 <span className="text-[10px] font-bold text-gray-400 uppercase">Diện tích ước tính</span>
                 <span className="text-lg font-black text-emerald-600">
                    {area > 0 ? area.toLocaleString(undefined, { maximumFractionDigits: 4 }) : '0'} <span className="text-xs font-bold">ha</span>
                 </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

