import { PlanStatus } from '../../../types/seasonPlan';
import { cn } from '../../../utils/cn';

interface StatusBadgeProps {
  status: PlanStatus;
  className?: string;
}

const STATUS_LABELS: Record<PlanStatus, string> = {
  DRAFT: 'Bản nháp',
  IN_PROGRESS: 'Đang thực hiện',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
};

const STATUS_COLORS: Record<PlanStatus, string> = {
  DRAFT: 'bg-slate-100 text-slate-700 border-slate-200',
  IN_PROGRESS: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  COMPLETED: 'bg-blue-50 text-blue-700 border-blue-200',
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
