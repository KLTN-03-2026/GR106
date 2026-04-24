import { useCallback, useMemo, useRef, useEffect } from "react";
import { GoogleMap, Marker, Polygon } from "@react-google-maps/api";
import { useGoogleMaps } from "../../providers/GoogleMapsProvider";
import { Plot } from "../../types/plot/plot";
import { Maximize, Map as MapIcon, Trash2 } from "lucide-react";
import { calculateCentroid, getPlotPath } from "../../utils/plotUtils";

interface LatLng {
  lat: number;
  lng: number;
}

interface LocationPickerMapProps {
  value: LatLng | null;
  onChange: (coords: LatLng | null) => void;
  plots?: Plot[];
}

const DEFAULT_CENTER = { lat: 10.762622, lng: 106.660172 };

const MAP_STYLES = [
  { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
];

const PLOT_OPTIONS = {
  fillColor: "#10b981",
  fillOpacity: 0.4,
  strokeColor: "#ffffff",
  strokeWeight: 2,
  clickable: false,
  editable: false,
  zIndex: 1,
};

const PLOT_LABEL_STYLE: Omit<google.maps.MarkerLabel, "text"> = {
  color: "#e79377ff",
  fontSize: "20px",
  fontWeight: "900",
  className: "plot-map-label",
};

export default function LocationPickerMap({ value, onChange, plots = [] }: LocationPickerMapProps) {
  const { isLoaded, loadError } = useGoogleMaps();
  const mapRef = useRef<google.maps.Map | null>(null);
  
  // Track để không pan/zoom khi người dùng chỉ re-render component
  const prevValueRef = useRef(value);
  const hasInitRef = useRef(false);

  // Khởi tạo giá trị center và zoom cố định cho GoogleMap (uncontrolled pattern)
  // Việc dùng useMemo với deps [] giúp props center/zoom không bao giờ thay đổi, tránh Map tự reset vị trí
  const initialCenter = useMemo(() => value || DEFAULT_CENTER, []);
  const initialZoom = useMemo(() => (value ? 16 : 12), []);

  const handleMapClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return;
      const coords = {
        lat: parseFloat(e.latLng.lat().toFixed(6)),
        lng: parseFloat(e.latLng.lng().toFixed(6)),
      };
      onChange(coords);
    },
    [onChange]
  );

  // Chỉ pan camera khi có value mới chuyển từ null -> có giá trị (user vừa chọn điểm)
  // KHÔNG pan camera khi value chuyển từ giá trị -> null (user bấm xóa)
  useEffect(() => {
    if (isLoaded && mapRef.current) {
      const prev = prevValueRef.current;
      prevValueRef.current = value;

      if (value && !prev) {
        mapRef.current.panTo(value);
        mapRef.current.setZoom(16);
      }
    }
  }, [isLoaded, value]);

  // Chuyển đổi geometry của lô đất sang format của Google Maps và tính centroid cho nhãn
  const plotData = useMemo(() => {
    return plots
      .filter(plot => plot.geometry?.coordinates?.[0])
      .map(plot => {
        const path = getPlotPath(plot);
        return {
          id: plot.id,
          name: plot.name,
          path: path,
          centroid: calculateCentroid(path)
        };
      });
  }, [plots]);

  const fitToPlots = useCallback(() => {
    if (!mapRef.current || plots.length === 0) return;
    
    const bounds = new google.maps.LatLngBounds();
    let hasValidPoints = false;

    plots.forEach(plot => {
      if (plot.geometry?.coordinates?.[0]) {
        plot.geometry.coordinates[0].forEach(coord => {
          bounds.extend({ lat: coord[1], lng: coord[0] });
          hasValidPoints = true;
        });
      }
    });

    if (hasValidPoints) {
      mapRef.current.fitBounds(bounds);
      const listener = google.maps.event.addListener(mapRef.current, 'idle', () => {
        if (mapRef.current) {
          const zoom = mapRef.current.getZoom();
          if (zoom && zoom > 18) mapRef.current.setZoom(18);
        }
        google.maps.event.removeListener(listener);
      });
    }
  }, [plots]);

  // Tự động focus khi plots được load lần đầu (chỉ khi chưa có value)
  useEffect(() => {
    if (isLoaded && mapRef.current && plots.length > 0 && !value && !hasInitRef.current) {
      hasInitRef.current = true;
      fitToPlots();
    }
  }, [isLoaded, plots.length, !!value, fitToPlots]);

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

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
      {/* Map Hint */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 bg-white/90 backdrop-blur-md text-[9px] font-black uppercase tracking-tighter text-slate-600 px-3 py-1.5 rounded-full shadow-sm border border-slate-200 pointer-events-none flex items-center gap-2">
        <MapIcon size={10} className="text-emerald-500" />
        Click để chọn vị trí kho
      </div>

      {/* Control Buttons */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            fitToPlots();
          }}
          className="w-8 h-8 bg-white/90 backdrop-blur-md rounded-lg shadow-sm border border-slate-200 flex items-center justify-center text-slate-600 hover:text-emerald-600 hover:bg-white transition-all active:scale-95"
          title="Thu phóng khớp các lô đất"
        >
          <Maximize size={14} />
        </button>

        {value && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onChange(null);
            }}
            className="w-8 h-8 bg-white/90 backdrop-blur-md rounded-lg shadow-sm border border-slate-200 flex items-center justify-center text-rose-500 hover:text-rose-600 hover:bg-white transition-all active:scale-95 animate-in zoom-in duration-200"
            title="Xóa vị trí đã chọn"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "300px" }}
        center={initialCenter}
        zoom={initialZoom}
        onClick={handleMapClick}
        onLoad={onLoad}
        mapTypeId="hybrid"
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
        {plotData.map(plot => (
          <div key={plot.id}>
            <Polygon
              path={plot.path}
              options={PLOT_OPTIONS}
            />
            {/* Nhãn tên lô đất */}
            <Marker
              position={plot.centroid}
              label={{
                ...PLOT_LABEL_STYLE,
                text: plot.name
              }}
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                fillOpacity: 0,
                strokeOpacity: 0,
                scale: 0
              }}
            />
          </div>
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

