import {
  useCallback, useMemo, Fragment, useRef, useEffect, useState,
  forwardRef, useImperativeHandle,
} from 'react'
import { GoogleMap, Polygon, Polyline, Marker, InfoWindow } from '@react-google-maps/api'
import { useGoogleMaps } from '../../../providers/GoogleMapsProvider'
import { Plot, GeoPoint } from '../../../types/plot'
import { PlotInfoPopup } from './PlotInfoPopup'
import {
  getColorFromId, calculateCentroid, polygonsOverlap,
  getPlotPath, segmentsIntersect, pointInPolygon,
} from '../../../utils/plotUtils'

const MAP_OPTIONS: google.maps.MapOptions = {
  mapTypeId: 'satellite', disableDefaultUI: false, zoomControl: true,
  mapTypeControl: false, scaleControl: true, streetViewControl: false,
  rotateControl: true, fullscreenControl: true,
}

export interface FarmMapHandle {
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
  onOverlapChange?: (overlappingPlotName: string | null) => void
}

const toLatLng = (geometry?: any): google.maps.LatLngLiteral[] => {
  if (!geometry?.coordinates) return []
  try {
    return geometry.coordinates[0].map((c: number[]) => ({ lng: c[0], lat: c[1] }))
  } catch { return [] }
}

// ── Kiểm tra segment (from→to) có cắt/chứa bởi bất kỳ lô nào không ──
function segVsPlots(from: GeoPoint, to: GeoPoint, plots: Plot[]): boolean {
  for (const plot of plots) {
    const path = getPlotPath(plot)
    if (path.length < 3) continue
    // Điểm đích nằm trong lô
    if (pointInPolygon(to, path)) return true
    // Segment cắt cạnh lô
    for (let i = 0; i < path.length; i++) {
      if (segmentsIntersect(from, to, path[i], path[(i + 1) % path.length])) return true
    }
  }
  return false
}



export const FarmMap = forwardRef<FarmMapHandle, FarmMapProps>(function FarmMap(
  { plots, selectedPlotId, isDrawing, isEditing, currentPath, onPathChange,
    onPlotSelect, selectedPlot, onEditBoundaries, onOverlapChange }, ref
) {
  const { isLoaded } = useGoogleMaps()
  const mapRef = useRef<google.maps.Map | null>(null)
  const editPolyRef = useRef<google.maps.Polygon | null>(null)
  const editListenersRef = useRef<google.maps.MapsEventListener[]>([])
  const rafRef = useRef<number | null>(null)

  // Drawing mode state
  const [hoverPoint, setHoverPoint] = useState<GeoPoint | null>(null)
  const [drawOverlap, setDrawOverlap] = useState(false)

  // Plots khác (loại trừ lô đang edit)
  const otherPlots = useMemo(
    () => plots.filter((p) => p.id !== selectedPlot?.id),
    [plots, selectedPlot]
  )

  useImperativeHandle(ref, () => ({
    getEditedPath(): GeoPoint[] {
      if (!editPolyRef.current) return currentPath
      const mvc = editPolyRef.current.getPath()
      const r: GeoPoint[] = []
      for (let i = 0; i < mvc.getLength(); i++)
        r.push({ lat: mvc.getAt(i).lat(), lng: mvc.getAt(i).lng() })
      return r
    },
  }))

  // ── DRAWING: click handler — chặn nếu overlap ──────────────────
  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (!isDrawing || isEditing || !e.latLng) return
    const newPt: GeoPoint = { lat: e.latLng.lat(), lng: e.latLng.lng() }

    // Kiểm tra điểm mới có nằm trong lô khác không
    if (otherPlots.some(p => {
      const path = getPlotPath(p)
      return path.length >= 3 && pointInPolygon(newPt, path)
    })) return // CHẶN

    // Kiểm tra segment cuối → điểm mới có cắt lô khác không
    if (currentPath.length > 0) {
      const last = currentPath[currentPath.length - 1]
      if (segVsPlots(last, newPt, otherPlots)) return // CHẶN
    }

    onPathChange([...currentPath, newPt])
  }, [isDrawing, isEditing, currentPath, onPathChange, otherPlots])

  // ── DRAWING: mouse move — cập nhật preview + overlap realtime ──
  const handleMapMouseMove = useCallback((e: google.maps.MapMouseEvent) => {
    if (!isDrawing || isEditing || !e.latLng) return
    const pt: GeoPoint = { lat: e.latLng.lat(), lng: e.latLng.lng() }
    setHoverPoint(pt)

    // Check hover point nằm trong lô nào
    const hoverInPlot = otherPlots.find(p => {
      const path = getPlotPath(p)
      return path.length >= 3 && pointInPolygon(pt, path)
    })
    if (hoverInPlot) {
      setDrawOverlap(true)
      onOverlapChange?.(hoverInPlot.name)
      return
    }

    // Check segment cuối → hover + các segment đã vẽ
    const segConflict = currentPath.length > 0
      ? otherPlots.find(p => {
          const path = getPlotPath(p)
          if (path.length < 3) return false
          const last = currentPath[currentPath.length - 1]
          for (let i = 0; i < path.length; i++) {
            if (segmentsIntersect(last, pt, path[i], path[(i + 1) % path.length])) return true
          }
          return false
        })
      : null

    // Check các segment đã vẽ
    const existingConflict = !segConflict
      ? otherPlots.find(p => {
          const path = getPlotPath(p)
          if (path.length < 3) return false
          for (let i = 0; i < currentPath.length - 1; i++) {
            for (let j = 0; j < path.length; j++) {
              if (segmentsIntersect(currentPath[i], currentPath[i+1], path[j], path[(j+1) % path.length])) return true
            }
          }
          return false
        })
      : null

    const conflict = segConflict || existingConflict
    setDrawOverlap(!!conflict)
    onOverlapChange?.(conflict ? conflict.name : null)
  }, [isDrawing, isEditing, currentPath, otherPlots, onOverlapChange])

  // ── Editing: checkOverlap với plots khác ──
  const checkEditOverlap = useCallback(
    (path: GeoPoint[]): Plot | null => {
      if (path.length < 3) return null
      return otherPlots.find(p => {
        const otherPath = getPlotPath(p)
        return otherPath.length >= 3 && polygonsOverlap(path, otherPath)
      }) ?? null
    },
    [otherPlots]
  )

  // ── EDITING: onLoad polygon ──────────────────────────────────────
  const handleEditPolyLoad = useCallback((poly: google.maps.Polygon) => {
    editPolyRef.current = poly
    const mvc = poly.getPath()

    const check = () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null
        const path: GeoPoint[] = []
        for (let i = 0; i < mvc.getLength(); i++)
          path.push({ lat: mvc.getAt(i).lat(), lng: mvc.getAt(i).lng() })
        const conflict = checkEditOverlap(path)
        poly.setOptions({
          fillColor: conflict ? '#ef4444' : '#10b981',
          strokeColor: conflict ? '#dc2626' : '#059669',
        })
        onOverlapChange?.(conflict ? conflict.name : null)
      })
    }

    editListenersRef.current.forEach(l => l.remove())
    editListenersRef.current = [
      mvc.addListener('set_at', check),
      mvc.addListener('insert_at', check),
      mvc.addListener('remove_at', check),
    ]
    // Check ngay khi bắt đầu
    const initOverlap = otherPlots.find(p => {
      const op = getPlotPath(p)
      return op.length >= 3 && polygonsOverlap(currentPath, op)
    })
    onOverlapChange?.(initOverlap ? initOverlap.name : null)
  }, [otherPlots, onOverlapChange, currentPath])

  const handleEditPolyUnmount = useCallback(() => {
    editListenersRef.current.forEach(l => l.remove())
    editListenersRef.current = []
    editPolyRef.current = null
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    rafRef.current = null
  }, [])

  // ── Reset khi thoát ─────────────────────────────────────────────
  useEffect(() => {
    if (!isDrawing) {
      setDrawOverlap(false)
      setHoverPoint(null)
      onOverlapChange?.(null)
    }
  }, [isDrawing, onOverlapChange])

  useEffect(() => () => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    editListenersRef.current.forEach(l => l.remove())
  }, [])

  // ── Center / fitBounds ─────────────────────────────────────────
  const center = useMemo(() => {
    if (selectedPlot?.geometry) {
      const p = toLatLng(selectedPlot.geometry)
      if (p.length) return calculateCentroid(p.map(x => ({ lat: x.lat, lng: x.lng })))
    }
    if (selectedPlot?.boundaries?.length) return calculateCentroid(selectedPlot.boundaries)
    return { lat: 10.3606, lng: 106.3653 }
  }, [selectedPlot])

  const onLoad = useCallback((map: google.maps.Map) => { mapRef.current = map }, [])
  const onUnmount = useCallback(() => { mapRef.current = null }, [])

  useEffect(() => {
    if (!mapRef.current || !window.google) return
    const bounds = new window.google.maps.LatLngBounds()
    let has = false

    if (selectedPlot) {
      // Zoom vào lô được chọn
      const pts = selectedPlot.geometry ? toLatLng(selectedPlot.geometry) : (selectedPlot.boundaries ?? [])
      pts.forEach(p => { bounds.extend(p); has = true })
    } else {
      // Không có lô nào được chọn — fit tất cả các lô hiện có
      plots.forEach(plot => {
        const pts = plot.geometry ? toLatLng(plot.geometry) : (plot.boundaries ?? [])
        pts.forEach(p => { bounds.extend(p); has = true })
      })
    }

    if (has) mapRef.current.fitBounds(bounds, 80)
  }, [selectedPlot, plots])

  if (!isLoaded)
    return (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
        <div className="text-emerald-700 font-black text-xl animate-bounce">Đang tải bản đồ...</div>
      </div>
    )

  const drawColor   = drawOverlap ? '#ef4444' : '#10b981'
  const drawStroke  = drawOverlap ? '#dc2626' : '#059669'
  const previewColor = drawOverlap ? '#ef4444' : '#3b82f6'

  return (
    <GoogleMap
      mapContainerStyle={{ width: '100%', height: '100%' }}
      center={center} zoom={16}
      onLoad={onLoad} onUnmount={onUnmount}
      options={MAP_OPTIONS}
      onClick={handleMapClick}
      onMouseMove={handleMapMouseMove}
    >
      {/* ── 1. Tất cả lô đất ── */}
      {plots.map((plot) => {
        const path = plot.geometry ? toLatLng(plot.geometry) : (plot.boundaries ?? [])
        if (path.length < 3) return null
        const isBeingEdited = isEditing && selectedPlotId === plot.id
        return (
          <Fragment key={plot.id}>
            <Polygon
              path={path}
              onClick={() => !isDrawing && onPlotSelect(plot)}
              options={{
                fillColor: getColorFromId(plot.id),
                fillOpacity: isBeingEdited ? 0 : selectedPlotId === plot.id ? 0.55 : 0.25,
                strokeColor: getColorFromId(plot.id),
                strokeOpacity: isBeingEdited ? 0 : 0.9,
                strokeWeight: selectedPlotId === plot.id ? 4 : 2,
                zIndex: selectedPlotId === plot.id ? 2 : 1,
                clickable: !isDrawing,
              }}
            />
            {!isBeingEdited && (
              <Marker
                position={calculateCentroid(path.map(p => ({ lat: p.lat, lng: p.lng })))}
                label={{ text: plot.name, color: '#fff', fontSize: '12px', fontWeight: '700' }}
                icon={{ path: window.google.maps.SymbolPath.CIRCLE, scale: 0 }}
              />
            )}
          </Fragment>
        )
      })}

      {/* ── 2a. DRAWING: segments đã vẽ ── */}
      {isDrawing && !isEditing && currentPath.length >= 2 && (
        <Polyline
          path={currentPath}
          options={{ strokeColor: drawStroke, strokeOpacity: 1, strokeWeight: 3, zIndex: 5 }}
        />
      )}

      {/* ── 2b. DRAWING: segment preview (cuối → hover) ── */}
      {isDrawing && !isEditing && currentPath.length >= 1 && hoverPoint && (
        <Polyline
          path={[currentPath[currentPath.length - 1], hoverPoint]}
          options={{ strokeColor: previewColor, strokeOpacity: 0.75, strokeWeight: 2, zIndex: 5 }}
        />
      )}

      {/* ── 2c. DRAWING: closing line (hover → đầu) ── */}
      {isDrawing && !isEditing && currentPath.length >= 3 && hoverPoint && (
        <Polyline
          path={[hoverPoint, currentPath[0]]}
          options={{ strokeColor: drawColor, strokeOpacity: 0.35, strokeWeight: 1.5, zIndex: 4 }}
        />
      )}

      {/* ── 2d. DRAWING: fill preview ── */}
      {isDrawing && !isEditing && currentPath.length >= 3 && (
        <Polygon
          path={currentPath}
          options={{
            fillColor: drawColor, fillOpacity: 0.15,
            strokeColor: 'transparent', strokeWeight: 0,
            clickable: false, zIndex: 4,
          }}
        />
      )}

      {/* ── 2e. DRAWING: vertex markers ── */}
      {isDrawing && !isEditing && currentPath.map((pt, i) => (
        <Marker
          key={`dp-${i}`}
          position={pt}
          icon={{
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: i === 0 ? 8 : 6,
            fillColor: i === 0 ? (drawOverlap ? '#ef4444' : '#10b981') : '#ffffff',
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: drawOverlap ? '#dc2626' : '#059669',
          }}
        />
      ))}

      {/* ── 3. EDITING: polygon kéo được ── */}
      {isEditing && selectedPlot && currentPath.length >= 3 && (
        <Polygon
          key={`edit-${selectedPlot.id}`}
          path={currentPath}
          onLoad={handleEditPolyLoad}
          onUnmount={handleEditPolyUnmount}
          options={{
            fillColor: '#10b981', fillOpacity: 0.3,
            strokeColor: '#059669', strokeOpacity: 1,
            strokeWeight: 3, editable: true, draggable: false, zIndex: 10,
          }}
        />
      )}

      {/* ── 4. Popup ── */}
      {selectedPlot && !isDrawing && !isEditing && (
        <InfoWindow
          position={
            (selectedPlot.geometry ? toLatLng(selectedPlot.geometry)[0] : null) ||
            selectedPlot.boundaries?.[0] || center
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
