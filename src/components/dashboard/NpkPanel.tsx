export interface NpkMetric {
  label: string;
  value: string;
  maxPpm: number;
  pct: number;
}

interface NpkBarProps {
  label: string;
  value: string;
  maxPpm: number;
  pct: number;
}

function NpkBar({ label, value, pct }: NpkBarProps) {
  const shortLabel = label.split(' ')[0].replace('Nitrogen', 'Mức N').replace('Phosphorus', 'Mức P').replace('Potassium', 'Mức K');

  return (
    <div className="w-full">
      <div className="relative h-4 bg-white/10 rounded-full overflow-hidden mb-1">
        <div
          className="absolute top-0 left-0 h-full rounded-full transition-all duration-1000"
          style={{
            width: `${pct}%`,
            background: "linear-gradient(to right, rgba(255,255,255,0.1), rgba(255,255,255,0.6))",
          }}
        />
      </div>
      <div className="flex justify-between items-center -mt-0.5">
        <span className="text-white/90 text-[10px] font-bold tracking-tight">{shortLabel}</span>
        <span className="text-white/90 text-[10px] font-medium">{value}</span>
      </div>
    </div>
  );
}

interface NpkPanelProps {
  data?: NpkMetric[];
  isLoading?: boolean;
}

export default function NpkPanel({
  data = [],
  isLoading = false,
}: NpkPanelProps) {
  return (
    <div
      className="rounded-2xl p-4 flex flex-col justify-center gap-3 w-full h-full"
      style={{ background: "#3D6B31" }}
    >
      {isLoading ? (
        <div className="flex flex-col gap-4 justify-center h-full">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-8 w-full bg-white/10 animate-pulse rounded-full"
            />
          ))}
        </div>
      ) : data.length > 0 ? (
        data.map((item, index) => (
          <NpkBar
            key={index}
            label={item.label}
            value={item.value}
            maxPpm={item.maxPpm}
            pct={item.pct}
          />
        ))
      ) : (
        <span className="text-white/80 text-[11px] text-center italic">
          Chưa có dữ liệu
        </span>
      )}
    </div>
  );
}
