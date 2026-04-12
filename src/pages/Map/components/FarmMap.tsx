import { useCallback, useMemo, Fragment } from 'react'
import {
  GoogleMap,
  useJsApiLoader,
  Polygon,
  Marker,
  InfoWindow,
} from '@react-google-maps/api'
import { ENV } from '../../../config/env'
import { Plot, GeoPoint } from '../../../types/plot'
import { PlotInfoPopup } from './PlotInfoPopup'

const LIBRARIES: ("drawing" | "geometry" | "places" | "visualization")[] = ['geometry', 'drawing']

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
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: ENV.GOOGLE_MAP_KEY,
    libraries: LIBRARIES,
  })

  
  // Center mặc định (ví dụ khu vực Tiền Giang/ĐBSCL) hoặc dựa trên plot có sẵn
  const center = useMemo(() => {
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
      {plots.map((plot) => (
        <Fragment key={plot.id}>
          {plot.boundaries && plot.boundaries.length > 0 && (
            <Polygon
              path={plot.boundaries}
              onClick={() => onPlotSelect(plot)}
              options={{
                fillColor: selectedPlotId === plot.id ? '#10b981' : '#ffffff',
                fillOpacity: selectedPlotId === plot.id ? 0.4 : 0.2,
                strokeColor: selectedPlotId === plot.id ? '#059669' : '#ffffff',
                strokeOpacity: 0.8,
                strokeWeight: selectedPlotId === plot.id ? 3 : 2,
                zIndex: selectedPlotId === plot.id ? 2 : 1,
              }}
            />
          )}
        </Fragment>
      ))}

      {/* 2. Hiển thị đường vẽ đang thực hiện (Drawing Mode) */}
      {isDrawing && currentPath.length > 0 && (
        <>
          <Polygon
            path={currentPath}
            options={{
              fillColor: '#10b981',
              fillOpacity: 0.4,
              strokeColor: '#059669',
              strokeOpacity: 1,
              strokeWeight: 3,
              editable: isEditing,
              draggable: isEditing,
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
}
