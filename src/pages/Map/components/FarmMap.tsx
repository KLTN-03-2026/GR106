import { useCallback, useMemo, Fragment } from 'react'
import {
  GoogleMap,
  Polygon,
  Marker,
  InfoWindow,
} from '@react-google-maps/api'
import { useGoogleMaps } from '../../../providers/GoogleMapsProvider'
import { Plot, GeoPoint } from '../../../types/plot'
import { PlotInfoPopup } from './PlotInfoPopup'
import { getColorFromId, calculateCentroid } from '../../../utils/plotUtils'

const MAP_OPTIONS: google.maps.MapOptions = {
  mapTypeId: 'roadmap',
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

interface FarmMapProps {
  plots: Plot[]
  selectedPlotId?: string
  isDrawing: boolean
  isEditing: boolean
  currentPath: GeoPoint[]
  onPathChange: (path: GeoPoint[]) => void
  onPlotSelect: (plot: Plot| null) => void
  selectedPlot: Plot | null
  onEditBoundaries: (plot: Plot) => void
}

const convertGeoJSONToPath = (geometry?: any): google.maps.LatLngLiteral[] => {
  if (!geometry || geometry.type !== 'Polygon' || !geometry.coordinates) return []
  try {
    // GeoJSON Polygon coordinates: [[[lng, lat], [lng, lat], ...]]
    return geometry.coordinates[0].map((coord: number[]) => ({
      lng: coord[0],
      lat: coord[1],
    }))
  } catch (e) {
    console.error('Lỗi chuyển đổi GeoJSON:', e)
    return []
  }
}

export function FarmMap({
  plots,
  selectedPlotId,
  isDrawing,
  isEditing,
  currentPath,
  onPathChange,
  onPlotSelect,
  selectedPlot,
  onEditBoundaries,
}: FarmMapProps) {
  const { isLoaded } = useGoogleMaps()

  // Center mặc định (ví dụ khu vực Tiền Giang/ĐBSCL) hoặc dựa trên plot có sẵn
  const center = useMemo(() => {
    if (selectedPlot?.geometry) {
      const path = convertGeoJSONToPath(selectedPlot.geometry)
      if (path.length > 0) return path[0]
    }
    if (selectedPlot?.boundaries && selectedPlot.boundaries.length > 0) {
      return selectedPlot.boundaries[0]
    }
    // Default location (e.g., Vietnam)
    return { lat: 10.3606, lng: 106.3653 }
  }, [selectedPlot])

  const onLoad = useCallback(() => {}, [])

  const onUnmount = useCallback(() => {}, [])

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (!isDrawing || !e.latLng) return

    const newPoint = {
      lat: e.latLng.lat(),
      lng: e.latLng.lng(),
    }
    onPathChange([...currentPath, newPoint])
  }

  if (!isLoaded) return (
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
        const path = plot.geometry 
          ? convertGeoJSONToPath(plot.geometry) 
          : (plot.boundaries || [])

        if (path.length < 3) return null

        return (
          <Fragment key={plot.id}>
            <Polygon
              path={path}
              onClick={() => onPlotSelect(plot)}
              options={{
                fillColor: getColorFromId(plot.id),
                fillOpacity: selectedPlotId === plot.id ? 0.6 : 0.3,
                strokeColor: getColorFromId(plot.id),
                strokeOpacity: 0.8,
                strokeWeight: selectedPlotId === plot.id ? 4 : 2,
                zIndex: selectedPlotId === plot.id ? 2 : 1,
              }}
            />
            {/* Hiển thị nhãn tên lô đất ở trung tâm */}
            <Marker
              position={calculateCentroid(path.map(p => ({ lat: p.lat, lng: p.lng })))}
              label={{
                text: plot.name,
                color: '#ffffff',
                fontSize: '12px',
                fontWeight: '900',
                className: 'bg-black/40 px-2 py-0.5 rounded-md backdrop-blur-sm'
              }}
              icon={{
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 0, // Ẩn icon marker, chỉ giữ label
              }}
            />
          </Fragment>
        )
      })}

      {/* 2. Hiển thị đường vẽ đang thực hiện (Drawing Mode) */}
      {isDrawing && currentPath.length > 0 && (
        <>
          <Polygon
            path={currentPath}
            onLoad={(poly) => {
              const path = poly.getPath();
              const updatePath = () => {
                const newPath: GeoPoint[] = [];
                for (let i = 0; i < path.getLength(); i++) {
                  newPath.push({ lat: path.getAt(i).lat(), lng: path.getAt(i).lng() });
                }
                onPathChange(newPath);
              };
              google.maps.event.addListener(path, 'set_at', updatePath);
              google.maps.event.addListener(path, 'insert_at', updatePath);
              google.maps.event.addListener(path, 'remove_at', updatePath);
            }}
            options={{
              fillColor: '#10b981',
              fillOpacity: 0.4,
              strokeColor: '#059669',
              strokeOpacity: 1,
              strokeWeight: 3,
              editable: true,
              draggable: true,
            }}
          />
          {currentPath.map((point, index) => (
            <Marker
              key={index}
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
}
