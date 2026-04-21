import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { SeasonPlan } from '../../../types/seasonPlan';
import { StatusBadge } from './StatusBadge';
import { Trash2, Copy, Eye, MoreVertical } from 'lucide-react';
import { Button } from '../../../components/ui/button';

interface PlanListProps {
  plans: SeasonPlan[];
  onSelectPlan: (plan: SeasonPlan) => void;
  onDeletePlan: (plan: SeasonPlan) => void;
  onClonePlan: (plan: SeasonPlan) => void;
}

export function PlanList({
  plans,
  onSelectPlan,
  onDeletePlan,
  onClonePlan,
}: PlanListProps) {
  const { crops } = useSelector((state: RootState) => state.crop);

  return (
    <div className="bg-white rounded-[32px] border border-slate-100 overflow-hidden shadow-sm">
      <div className="overflow-x-auto no-scrollbar">
        <table className="min-w-full divide-y divide-slate-100">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Tên kế hoạch</th>
              <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Lô đất mục tiêu</th>
              <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Cây trồng</th>
              <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Chu kỳ triển khai</th>
              <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Trạng thái</th>
              <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 bg-white">
            {plans.map((plan) => {
              const crop = crops.find((c) => c.id === plan.cropId);
              const plotNames = plan.plots && plan.plots.length > 0
                ? plan.plots.map(p => p.plotName).join(', ')
                : 'N/A';

              return (
                <tr
                  key={plan.id}
                  className="group hover:bg-slate-50/80 cursor-pointer transition-all"
                  onClick={() => onSelectPlan(plan)}
                >
                  <td className="px-8 py-6 whitespace-nowrap">
                    <div className="text-sm font-black text-slate-800 tracking-tight group-hover:text-emerald-600 transition-colors">
                      {plan.name}
                    </div>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    <div className="text-xs font-bold text-slate-600 max-w-[200px] truncate" title={plotNames}>
                      {plotNames}
                    </div>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    <div className="inline-flex items-center px-2 py-1 bg-slate-100 rounded-lg text-[10px] font-black text-slate-500 uppercase">
                      {crop?.name || 'N/A'}
                    </div>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    <div className="text-xs font-bold text-slate-500 italic">
                      {new Date(plan.startDate).toLocaleDateString('vi-VN')} → {new Date(plan.endDate).toLocaleDateString('vi-VN')}
                    </div>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    <StatusBadge status={plan.status} />
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onClonePlan(plan)}
                        className="w-8 h-8 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                        title="Nhân bản"
                      >
                        <Copy size={14} strokeWidth={2.5} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDeletePlan(plan)}
                        className="w-8 h-8 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                        title="Xóa"
                      >
                        <Trash2 size={14} strokeWidth={2.5} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onSelectPlan(plan)}
                        className="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all"
                        title="Xem chi tiết"
                      >
                        <Eye size={14} strokeWidth={2.5} />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {plans.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 bg-white">
            <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-200 mb-4">
              <MoreVertical size={24} />
            </div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Không tìm thấy kế hoạch nào</p>
          </div>
        )}
      </div>
    </div>
  );
}
