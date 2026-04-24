import { useCallback, useMemo } from "react";
import { GoogleMap, Marker, Polygon } from "@react-google-maps/api";
import { useGoogleMaps } from "../../providers/GoogleMapsProvider";
import { Plot } from "../../types/plot";

interface LatLng {
  lat: number;
  lng: number;
}

interface LocationPickerMapProps {
  value: LatLng | null;
  onChange: (coords: LatLng) => void;
  plots?: Plot[];
}

const DEFAULT_CENTER = { lat: 10.762622, lng: 106.660172 };

const MAP_STYLES = [
  { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
];

const PLOT_OPTIONS = {
  fillColor: "#10b981",
  fillOpacity: 0.3,
  strokeColor: "#059669",
  strokeWeight: 2,
  clickable: false,
  editable: false,
  zIndex: 1,
};

export default function LocationPickerMap({ value, onChange, plots = [] }: LocationPickerMapProps) {
  const { isLoaded, loadError } = useGoogleMaps();

  const handleMapClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return;
      onChange({
        lat: parseFloat(e.latLng.lat().toFixed(6)),
        lng: parseFloat(e.latLng.lng().toFixed(6)),
      });
    },
    [onChange]
  );

  // Chuyển đổi geometry của lô đất sang format của Google Maps
  const plotPolygons = useMemo(() => {
    return plots
      .filter(plot => plot.geometry?.coordinates?.[0])
      .map(plot => ({
        id: plot.id,
        path: plot.geometry!.coordinates[0].map(coord => ({
          lat: coord[1],
          lng: coord[0],
        }))
      }));
  }, [plots]);

  const onLoad = useCallback(() => {}, []);

  if (loadError) {
    return (
      <div className="flex items-center justify-center h-[300px] rounded-2xl border border-red-200 bg-red-50 text-red-500 text-[10px] font-bold p-4 text-center">
        Không thể tải bản đồ. Vui lòng kiểm tra cấu hình.
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-[300px] rounded-2xl border border-slate-100 bg-slate-50 text-slate-400 text-[10px] font-bold animate-pulse">
        Đang tải Google Maps...
      </div>
    );
  }

  return (
    <div className="relative group rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 bg-white/90 backdrop-blur-md text-[9px] font-black uppercase tracking-tighter text-slate-600 px-3 py-1.5 rounded-full shadow-sm border border-slate-200 pointer-events-none">
        Click để chọn vị trí kho
      </div>

      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "300px" }}
        center={value || DEFAULT_CENTER}
        zoom={value ? 16 : 12}
        onClick={handleMapClick}
        onLoad={onLoad}
        options={{
          styles: MAP_STYLES,
          disableDefaultUI: false,
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
        }}
      >
        {/* Render các lô đất hiện có */}
        {plotPolygons.map(plot => (
          <Polygon
            key={plot.id}
            path={plot.path}
            options={PLOT_OPTIONS}
          />
        ))}

        {value && (
          <Marker
            position={value}
            animation={google.maps.Animation.DROP}
          />
        )}
      </GoogleMap>

      {value && (
        <div className="absolute bottom-3 left-3 z-10 bg-emerald-600 text-white text-[9px] font-mono font-bold px-2 py-1 rounded-lg shadow-lg">
          {value.lat}, {value.lng}
        </div>
      )}
    </div>
  );
}

