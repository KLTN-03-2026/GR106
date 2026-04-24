interface Props {
  show: boolean;
}

export function MapHint({ show }: Props) {
  if (!show) return null;
  
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md px-6 py-3 rounded-2xl shadow-xl border border-white/50 text-gray-700 font-bold text-sm flex items-center gap-3 animate-bounce z-10">
      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
      Sử dụng thanh công cụ để vẽ lô đất mới hoặc chọn lô đất có sẵn
    </div>
  );
}
