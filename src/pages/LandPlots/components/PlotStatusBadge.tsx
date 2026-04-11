interface PlotStatusBadgeProps {
  status: string
}

export function PlotStatusBadge({ status }: PlotStatusBadgeProps) {
  if (status === 'ACTIVE') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] uppercase font-black bg-emerald-100 text-emerald-800 border border-emerald-200 tracking-wider">
        Đang hoạt động
      </span>
    )
  }
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] uppercase font-black bg-slate-100 text-slate-800 border border-slate-200 tracking-wider">
      Ngưng hoạt động
    </span>
  )
}
