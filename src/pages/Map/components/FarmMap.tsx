import { useCallback, useMemo, Fragment, useRef, useEffect, forwardRef, useImperativeHandle } from 'react'
import {
  GoogleMap,
  Polygon,
  Marker,
  InfoWindow,
} from '@react-google-maps/api'
import { useGoogleMaps } from '../../../providers/GoogleMapsProvider'
import { Plot, GeoPoint } from '../../../types/plot'
import { PlotInfoPopup } from './PlotInfoPopup'
import { getColorFromId, calculateCentroid, polygonsOverlap, getPlotPath } from '../../../utils/plotUtils'

const MAP_OPTIONS: google.maps.MapOptions = {
  mapTypeId: 'satellite',
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: false,
  scaleControl: true,
  streetViewControl: false,
  rotateControl: true,
  fullscreenControl: true,
  styles: [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }],
    },
  ],
}

export interface FarmMapHandle {
  /** Đọc path hiện tại của polygon đang chỉnh sửa từ Google Maps instance */
  getEditedPath: () => GeoPoint[]
}

interface FarmMapProps {
  plots: Plot[]
  selectedPlotId?: string
  isDrawing: boolean
  isEditing: boolean
  currentPath: GeoPoint[]
  onPathChange: (path: GeoPoint[]) => void
  onPlotSelect: (plot: Plot | null) => void
  selectedPlot: Plot | null
  onEditBoundaries: (plot: Plot) => void
  /** Callback khi trạng thái chồng chéo thay đổi (real-time) */
  onOverlapChange?: (isOverlapping: boolean) => void
}

const convertGeoJSONToPath = (geometry?: any): google.maps.LatLngLiteral[] => {
  if (!geometry || geometry.type !== 'Polygon' || !geometry.coordinates) return []
  try {
    return geometry.coordinates[0].map((coord: number[]) => ({
      lng: coord[0],
      lat: coord[1],
    }))
  } catch (e) {
    console.error('Lỗi chuyển đổi GeoJSON:', e)
    return []
  }
}

export const FarmMap = forwardRef<FarmMapHandle, FarmMapProps>(function FarmMap(
  {
    plots,
    selectedPlotId,
    isDrawing,
    isEditing,
    currentPath,
    onPathChange,
    onPlotSelect,
    selectedPlot,
    onEditBoundaries,
    onOverlapChange,
  },
  ref
) {
  const { isLoaded } = useGoogleMaps()
  const mapRef = useRef<google.maps.Map | null>(null)

  // Ref cho polygon đang chỉnh sửa (editing mode)
  const editPolyRef = useRef<google.maps.Polygon | null>(null)
  // Listeners của editing polygon để cleanup
  const editListenersRef = useRef<google.maps.MapsEventListener[]>([])
  // RAF handle để throttle overlap check
  const rafRef = useRef<number | null>(null)
  // Trạng thái chồng chéo hiện tại (dùng ref để tránh stale closure)
  const isOverlappingRef = useRef(false)

  // Expose getEditedPath() để MapPage có thể đọc khi Save
  useImperativeHandle(ref, () => ({
    getEditedPath(): GeoPoint[] {
      if (!editPolyRef.current) return currentPath
      const mvcPath = editPolyRef.current.getPath()
      const path: GeoPoint[] = []
      for (let i = 0; i < mvcPath.getLength(); i++) {
        path.push({ lat: mvcPath.getAt(i).lat(), lng: mvcPath.getAt(i).lng() })
      }
      return path
    },
  }))

  // Danh sách plots khác (loại trừ plot đang edit để không check overlap với chính nó)
  const otherPlots = useMemo(
    () => plots.filter((p) => p.id !== selectedPlot?.id),
    [plots, selectedPlot]
  )

  // Kiểm tra overlap của path với các plots khác
  const checkOverlap = useCallback(
    (path: GeoPoint[]): boolean => {
      if (path.length < 3) return false
      return otherPlots.some((p) => {
        const otherPath = getPlotPath(p)
        if (otherPath.length < 3) return false
        return polygonsOverlap(path, otherPath)
      })
    },
    [otherPlots]
  )

  // Thông báo và cập nhật màu polygon khi overlap thay đổi
  const notifyOverlap = useCallback(
    (poly: google.maps.Polygon, hasOverlap: boolean) => {
      if (hasOverlap === isOverlappingRef.current) return // Không thay đổi → bỏ qua
      isOverlappingRef.current = hasOverlap
      onOverlapChange?.(hasOverlap)

      // Đổi màu polygon real-time
      poly.setOptions({
        fillColor: hasOverlap ? '#ef4444' : '#10b981',
        strokeColor: hasOverlap ? '#dc2626' : '#059669',
      })
    },
    [onOverlapChange]
  )

  // Center bản đồ
  const center = useMemo(() => {
    if (selectedPlot?.geometry) {
      const path = convertGeoJSONToPath(selectedPlot.geometry)
      if (path.length > 0) return calculateCentroid(path.map((p) => ({ lat: p.lat, lng: p.lng })))
    }
    if (selectedPlot?.boundaries && selectedPlot.boundaries.length > 0) {
      return calculateCentroid(selectedPlot.boundaries)
    }
    return { lat: 10.3606, lng: 106.3653 }
  }, [selectedPlot])

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map
  }, [])

  const onUnmount = useCallback(() => {
    mapRef.current = null
  }, [])

  // Auto fitBounds khi selectedPlot thay đổi
  useEffect(() => {
    if (!mapRef.current || !window.google) return
    const map = mapRef.current
    const bounds = new window.google.maps.LatLngBounds()
    let hasBounds = false

    if (selectedPlot?.geometry) {
      convertGeoJSONToPath(selectedPlot.geometry).forEach((point) => {
        bounds.extend(point)
        hasBounds = true
      })
    } else if (selectedPlot?.boundaries?.length) {
      selectedPlot.boundaries.forEach((point) => {
        bounds.extend(point)
        hasBounds = true
      })
    }
    if (hasBounds) map.fitBounds(bounds, 80)
  }, [selectedPlot])

  // Reset overlap state khi thoát khỏi drawing/editing
  useEffect(() => {
    if (!isDrawing) {
      isOverlappingRef.current = false
      onOverlapChange?.(false)
    }
  }, [isDrawing, onOverlapChange])

  // Cleanup RAF khi unmount
  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
      editListenersRef.current.forEach((l) => l.remove())
      editListenersRef.current = []
    }
  }, [])

  // Handler click bản đồ (chỉ dùng khi đang vẽ mới, không phải editing)
  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (!isDrawing || isEditing || !e.latLng) return

    const newPoint = { lat: e.latLng.lat(), lng: e.latLng.lng() }
    const newPath = [...currentPath, newPoint]
    onPathChange(newPath)
  }

  // Handler onLoad cho editing polygon
  const handleEditPolyLoad = useCallback(
    (poly: google.maps.Polygon) => {
      editPolyRef.current = poly
      const mvcPath = poly.getPath()

      const scheduleCheck = () => {
        if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
        rafRef.current = requestAnimationFrame(() => {
          rafRef.current = null
          const newPath: GeoPoint[] = []
          for (let i = 0; i < mvcPath.getLength(); i++) {
            newPath.push({ lat: mvcPath.getAt(i).lat(), lng: mvcPath.getAt(i).lng() })
          }
          const hasOverlap = checkOverlap(newPath)
          notifyOverlap(poly, hasOverlap)
        })
      }

      // Cleanup listeners cũ
      editListenersRef.current.forEach((l) => l.remove())
      editListenersRef.current = [
        mvcPath.addListener('set_at', scheduleCheck),
        mvcPath.addListener('insert_at', scheduleCheck),
        mvcPath.addListener('remove_at', scheduleCheck),
      ]

      // Kiểm tra overlap ngay khi bắt đầu edit
      const initialPath = currentPath
      const hasOverlap = checkOverlap(initialPath)
      isOverlappingRef.current = hasOverlap
      onOverlapChange?.(hasOverlap)
    },
    [checkOverlap, notifyOverlap, onOverlapChange, currentPath]
  )

  const handleEditPolyUnmount = useCallback(() => {
    editListenersRef.current.forEach((l) => l.remove())
    editListenersRef.current = []
    editPolyRef.current = null
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    rafRef.current = null
  }, [])

  // Handler onLoad cho drawing polygon
  const handleDrawPolyLoad = useCallback(
    (poly: google.maps.Polygon) => {
      const mvcPath = poly.getPath()

      const scheduleCheck = () => {
        if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
        rafRef.current = requestAnimationFrame(() => {
          rafRef.current = null
          const newPath: GeoPoint[] = []
          for (let i = 0; i < mvcPath.getLength(); i++) {
            newPath.push({ lat: mvcPath.getAt(i).lat(), lng: mvcPath.getAt(i).lng() })
          }
          onPathChange(newPath)
          const hasOverlap = checkOverlap(newPath)
          notifyOverlap(poly, hasOverlap)
        })
      }

      mvcPath.addListener('set_at', scheduleCheck)
      mvcPath.addListener('insert_at', scheduleCheck)
      mvcPath.addListener('remove_at', scheduleCheck)
    },
    [checkOverlap, notifyOverlap, onPathChange]
  )

  // Kiểm tra overlap khi currentPath thay đổi (drawing mode, sau mỗi click)
  useEffect(() => {
    if (!isDrawing || isEditing || currentPath.length < 3) return
    // Drawing mode: check overlap sau mỗi click
    // Không có poly ref → chỉ cập nhật state overlap (poly tự đổi màu qua listener)
    const hasOverlap = checkOverlap(currentPath)
    if (hasOverlap !== isOverlappingRef.current) {
      isOverlappingRef.current = hasOverlap
      onOverlapChange?.(hasOverlap)
    }
  }, [currentPath, isDrawing, isEditing, checkOverlap, onOverlapChange])

  if (!isLoaded)
    return (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center animate-pulse">
        <div className="text-emerald-700 font-black text-xl animate-bounce">Đang tải bản đồ...</div>
      </div>
    )

  return (
    <GoogleMap
      mapContainerStyle={{ width: '100%', height: '100%' }}
      center={center}
      zoom={16}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={MAP_OPTIONS}
      onClick={handleMapClick}
    >
      {/* 1. Hiển thị tất cả các lô đất hiện có */}
      {plots.map((plot) => {
        const path = plot.geometry ? convertGeoJSONToPath(plot.geometry) : plot.boundaries || []
        if (path.length < 3) return null

        // Ẩn polygon của plot đang edit (vì có editing polygon riêng)
        const isBeingEdited = isEditing && selectedPlotId === plot.id

        return (
          <Fragment key={plot.id}>
            <Polygon
              path={path}
              onClick={() => onPlotSelect(plot)}
              options={{
                fillColor: getColorFromId(plot.id),
                fillOpacity: isBeingEdited ? 0 : selectedPlotId === plot.id ? 0.6 : 0.3,
                strokeColor: getColorFromId(plot.id),
                strokeOpacity: isBeingEdited ? 0 : 0.8,
                strokeWeight: selectedPlotId === plot.id ? 4 : 2,
                zIndex: selectedPlotId === plot.id ? 2 : 1,
              }}
            />
            <Marker
              position={calculateCentroid(path.map((p) => ({ lat: p.lat, lng: p.lng })))}
              label={{
                text: plot.name,
                color: '#ffffff',
                fontSize: '12px',
                fontWeight: '900',
              }}
              icon={{
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 0,
              }}
            />
          </Fragment>
        )
      })}

      {/* 2a. DRAWING mode: vẽ mới bằng click */}
      {isDrawing && !isEditing && currentPath.length > 0 && (
        <>
          <Polygon
            key="drawing-poly"
            path={currentPath}
            onLoad={handleDrawPolyLoad}
            options={{
              fillColor: '#10b981',
              fillOpacity: 0.4,
              strokeColor: '#059669',
              strokeOpacity: 1,
              strokeWeight: 3,
              editable: true,
              draggable: false,
            }}
          />
          {currentPath.map((point, index) => (
            <Marker
              key={`draw-pt-${index}`}
              position={point}
              icon={{
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 6,
                fillColor: index === 0 ? '#ef4444' : '#ffffff',
                fillOpacity: 1,
                strokeWeight: 2,
                strokeColor: '#059669',
              }}
            />
          ))}
        </>
      )}

      {/* 2b. EDITING mode: kéo các điểm đã có */}
      {isEditing && selectedPlot && currentPath.length > 0 && (
        <Polygon
          key={`edit-${selectedPlot.id}`}
          path={currentPath}
          onLoad={handleEditPolyLoad}
          onUnmount={handleEditPolyUnmount}
          options={{
            fillColor: '#10b981',
            fillOpacity: 0.4,
            strokeColor: '#059669',
            strokeOpacity: 1,
            strokeWeight: 3,
            editable: true,
            draggable: false,
            zIndex: 10,
          }}
        />
      )}

      {/* 3. Popup thông tin */}
      {selectedPlot && !isDrawing && !isEditing && (
        <InfoWindow
          position={
            (selectedPlot.geometry ? convertGeoJSONToPath(selectedPlot.geometry)[0] : null) ||
            selectedPlot.boundaries?.[0] ||
            center
          }
          onCloseClick={() => onPlotSelect(null)}
        >
          <PlotInfoPopup
            plot={selectedPlot}
            onClose={() => onPlotSelect(null)}
            onEditBoundaries={onEditBoundaries}
          />
        </InfoWindow>
      )}
    </GoogleMap>
  )
})
