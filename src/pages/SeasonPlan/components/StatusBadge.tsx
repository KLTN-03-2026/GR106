import { PlanStatus } from '../../../types/seasonPlan';
import { cn } from '../../../utils/cn';

interface StatusBadgeProps {
  status: PlanStatus;
  className?: string;
}

const STATUS_LABELS: Record<PlanStatus, string> = {
  DRAFT: 'Bản nháp',
  ACTIVE: 'Đang thực hiện',
  READY_TO_HARVEST: 'Sẵn sàng thu hoạch',
  HARVESTING: 'Đang thu hoạch',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
};

const STATUS_COLORS: Record<PlanStatus, string> = {
  DRAFT: 'bg-slate-100 text-slate-700 border-slate-200',
  ACTIVE: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  READY_TO_HARVEST: 'bg-lime-50 text-lime-700 border-lime-200',
  HARVESTING: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  COMPLETED: 'bg-slate-50 text-slate-400 border-slate-200',
  CANCELLED: 'bg-rose-50 text-rose-700 border-rose-200',
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border",
        STATUS_COLORS[status],
        className
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
