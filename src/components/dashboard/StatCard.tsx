interface StatCardProps {
  label: string;
  value: string | number;
  unit: string;
  isLoading?: boolean;
}

export default function StatCard({
  label,
  value,
  unit,
  isLoading = false,
}: StatCardProps) {
  return (
    <div className="bg-white rounded-xl p-3 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between h-full min-h-0 overflow-hidden">
      <div className="flex justify-between items-start">
        <p className="text-[11px] font-medium text-gray-400 uppercase tracking-tight leading-none">{label}</p>
        <span className="text-[10px] text-gray-300 font-bold">••</span>
      </div>
      <div className="flex items-baseline gap-1 mt-auto">
        {isLoading ? (
          <div className="h-7 w-12 bg-gray-100 animate-pulse rounded" />
        ) : (
          <span className="text-[22px] font-extrabold text-gray-800 leading-none">{value}</span>
        )}
        <span className="text-[10px] text-gray-400 font-medium mb-0.5">{unit}</span>
      </div>
    </div>
  );
}
