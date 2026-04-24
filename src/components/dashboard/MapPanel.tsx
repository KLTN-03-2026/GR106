import { useRef, useCallback } from "react";
import { GoogleMap } from "@react-google-maps/api";
import { ChevronDown, Maximize2, RefreshCw, Plus, Minus } from "lucide-react";
import { Button } from "../ui/button";
import { useGoogleMaps } from "../../providers/GoogleMapsProvider";

const DEFAULT_CENTER = { lat: 16.0544, lng: 108.2022 };
const DEFAULT_ZOOM = 13;

export default function MapPanel() {
  const mainMapRef = useRef<google.maps.Map | null>(null);
  const { isLoaded } = useGoogleMaps();

  const onMainMapLoad = useCallback((map: google.maps.Map) => {
    mainMapRef.current = map;
  }, []);

  const onMainMapIdle = useCallback(() => {
    // No-op or handle main map idle
  }, []);

  const handleZoomIn = useCallback(() => {
    const map = mainMapRef.current;
    if (!map) return;
    map.setZoom((map.getZoom() ?? DEFAULT_ZOOM) + 1);
  }, []);

  const handleZoomOut = useCallback(() => {
    const map = mainMapRef.current;
    if (!map) return;
    map.setZoom((map.getZoom() ?? DEFAULT_ZOOM) - 1);
  }, []);

  const handleRefresh = useCallback(() => {
    const map = mainMapRef.current;
    if (!map) return;
    map.setCenter(DEFAULT_CENTER);
    map.setZoom(DEFAULT_ZOOM);
  }, []);

  const mapOptions: google.maps.MapOptions = {
    disableDefaultUI: true,
    gestureHandling: "greedy",
  };

  return (
    <div className="relative w-full h-full rounded-[22px] overflow-hidden shrink-0 shadow-md">
      {isLoaded ? (
        <GoogleMap
          mapContainerStyle={{ width: "100%", height: "100%" }}
          center={DEFAULT_CENTER}
          zoom={DEFAULT_ZOOM}
          options={mapOptions}
          onLoad={onMainMapLoad}
          onIdle={onMainMapIdle}
        />
      ) : (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <span className="text-sm text-gray-400">Loading map...</span>
        </div>
      )}

      {/* Map label */}
      <div className="absolute top-5 left-8 z-20 bg-white rounded-full px-4 py-1.5 flex items-center gap-1.5 shadow-sm">
        <span className="text-sm font-medium text-black">Map</span>
        <ChevronDown size={13} color="#000" />
      </div>

      {/* Maximize button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-[22px] right-8 z-20 shadow-sm rounded-[10px] bg-white hover:bg-gray-50"
      >
        <Maximize2 size={18} />
      </Button>

      {/* Zoom controls */}
      <div className="absolute bottom-[85px] right-8 z-20 bg-white rounded-[20px] w-9 h-[72px] flex flex-col items-center justify-center gap-2 shadow-sm">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleZoomIn}
          className="h-6 w-6 p-1"
        >
          <Plus size={16} />
        </Button>
        <div className="w-5 h-px bg-gray-200" />
        <Button
          variant="ghost"
          size="sm"
          onClick={handleZoomOut}
          className="h-6 w-6 p-1"
        >
          <Minus size={16} />
        </Button>
      </div>

      {/* Refresh button - moved from mini-map to main map controls area if needed, 
          or just keep it as is but without the mini-map wrapper */}
      <div 
        className="absolute bottom-5 right-8 z-20 w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-sm cursor-pointer hover:bg-gray-50"
        onClick={handleRefresh}
      >
        <RefreshCw size={18} className="text-slate-600" />
      </div>
    </div>
  );
}
