type Status =
  | 'active' | 'pending' | 'rejected' | 'expired' | 'cancelled' | 'accepted'
  | 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'CANCELLED'

export function StatusBadge({ status }: { status: Status | string }) {
  const config: Record<string, { label: string; className: string }> = {
    active: { label: 'Đang hoạt động', className: 'bg-emerald-100 text-emerald-700' },
    pending: { label: 'Chờ chấp nhận', className: 'bg-amber-100 text-amber-700' },
    rejected: { label: 'Đã từ chối', className: 'bg-red-100 text-red-700' },
    expired: { label: 'Đã hết hạn', className: 'bg-red-100 text-red-700' },
    cancelled: { label: 'Đã hủy', className: 'bg-gray-100 text-gray-700' },
    accepted: { label: 'Đã chấp nhận', className: 'bg-emerald-100 text-emerald-700' },
    PENDING: { label: 'Chờ chấp nhận', className: 'bg-amber-100 text-amber-700' },
    ACCEPTED: { label: 'Đã chấp nhận', className: 'bg-emerald-100 text-emerald-700' },
    EXPIRED: { label: 'Đã hết hạn', className: 'bg-red-100 text-red-700' },
    CANCELLED: { label: 'Đã hủy', className: 'bg-gray-100 text-gray-700' },
  }

  const cfg = config[status]
  if (!cfg) return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
      {status}
    </span>
  )

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${cfg.className}`}>
      {cfg.label}
    </span>
  )
}