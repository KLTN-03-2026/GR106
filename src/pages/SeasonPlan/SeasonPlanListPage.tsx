import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { SeasonPlan, PlanStatus, StatusObject } from '../../types/seasonPlan';
import { fetchPlans, createPlan, removePlan } from '../../store/seasonPlanSlice';
import { fetchPlots } from '../../store/plotSlice';
import { fetchCrops } from '../../store/cropSlice';
import { canEditPlan } from '../../utils/seasonPlanUtils';
import { Search, Calendar, Loader2, Info, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { cn } from '../../utils/cn';
import { Button } from '../../components/ui/button';
import { CreatePlanModal } from './components/CreatePlanModal';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { useAuth } from '../../hooks/useAuth';

export function SeasonPlanListPage() {
  const { farmId } = useParams<{ farmId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  const { plans, loading, error } = useSelector((state: RootState) => state.seasonPlan);
  const { user, accessToken } = useAuth();
  
  // Kiểm tra quyền: Ưu tiên role trong user object, fallback kiểm tra trực tiếp trong token
  const canEdit = canEditPlan(user?.role, accessToken);

  useEffect(() => {
 
    if (!farmId || !accessToken) {
      return;
    }
    
    dispatch(fetchPlans());
  }, [dispatch, accessToken, farmId]);

  const farmPlans = plans.filter((p: SeasonPlan) => p.farmId === farmId || p.farmId === '');

  const [statusFilter, setStatusFilter] = useState<PlanStatus | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Notification Modal state
  const [notification, setNotification] = useState<{
    isOpen: boolean;
    type: 'success' | 'error';
    title: string;
    message: string;
    details?: string[];
  }>({
    isOpen: false,
    type: 'success',
    title: '',
    message: '',
  });

  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    planId: string | null;
    isDeleting: boolean;
  }>({
    isOpen: false,
    planId: null,
    isDeleting: false
  });

  useEffect(() => {
    if (isCreateModalOpen) {
      dispatch(fetchPlots());
      dispatch(fetchCrops());
    }
  }, [isCreateModalOpen, dispatch]);

  const filteredPlans = farmPlans.filter((p: SeasonPlan) => {
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleCreatePlan = async (newPlanData: any) => {
    console.log('[SeasonPlanListPage] handleCreatePlan called with:', newPlanData);
    try {
      await dispatch(createPlan(newPlanData)).unwrap();
      console.log('[SeasonPlanListPage] createPlan succeeded');
      setIsCreateModalOpen(false);
    } catch (err: any) {
      console.error('[SeasonPlanListPage] createPlan failed:', err);
      let errorMsg = 'Dữ liệu không hợp lệ. Hãy kiểm tra lại thời gian bắt đầu/kết thúc.';
      let details: string[] = [];
      
      if (err && typeof err === 'object') {
        if (err.message) errorMsg = err.message;
        if (err.data && typeof err.data === 'object') {
          details = Object.entries(err.data).map(([key, val]: [string, any]) => `${key}: ${val}`);
        }
      } else if (typeof err === 'string') {
        errorMsg = err;
      }

      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Lỗi tạo kế hoạch',
        message: errorMsg,
        details: details.length > 0 ? details : undefined
      });
    }
  };

  const handleDeletePlan = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeleteConfirm({
      isOpen: true,
      planId: id,
      isDeleting: false
    });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.planId) return;
    
    setDeleteConfirm(prev => ({ ...prev, isDeleting: true }));
    try {
      await dispatch(removePlan(deleteConfirm.planId)).unwrap();
      setDeleteConfirm({ isOpen: false, planId: null, isDeleting: false });
    } catch (err: any) {
      setDeleteConfirm(prev => ({ ...prev, isDeleting: false, isOpen: false }));
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Lỗi xóa kế hoạch',
        message: typeof err === 'string' ? err : 'Không thể xóa kế hoạch này'
      });
    }
  };

  const getStatusLabel = (status: PlanStatus | StatusObject) => {
    const code = typeof status === 'string' ? status : status.code;
    switch (code) {
      case 'DRAFT': return 'Bản nháp';
      case 'ACTIVE': return 'Đang thực hiện';
      case 'READY_TO_HARVEST': return 'Sẵn sàng thu hoạch';
      case 'HARVESTING': return 'Đang thu hoạch';
      case 'COMPLETED': return 'Hoàn thành';
      case 'CANCELLED': return 'Đã hủy';
      default: return code;
    }
  };

  const getStatusColor = (status: PlanStatus | StatusObject) => {
    const code = typeof status === 'string' ? status : status.code;
    switch (code) {
      case 'DRAFT': return 'bg-slate-100 text-slate-600';
      case 'ACTIVE': return 'bg-indigo-100 text-indigo-700';
      case 'READY_TO_HARVEST': return 'bg-lime-100 text-lime-700';
      case 'HARVESTING': return 'bg-emerald-100 text-emerald-700';
      case 'COMPLETED': return 'bg-slate-100 text-slate-400';
      case 'CANCELLED': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '---';
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-slate-50 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col gap-4 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Kế hoạch mùa vụ</h1>
            <p className="text-sm text-slate-500 mt-0.5">Danh sách các mùa vụ của trang trại</p>
          </div>
          <div className="flex items-center gap-3">
            {canEdit ? (
              <Button 
                className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-100 transition-all font-bold px-6"
                onClick={() => setIsCreateModalOpen(true)}
              >
                + Tạo vụ mùa
              </Button>
            ) : (
              <div className="px-4 py-2 bg-slate-100 rounded-xl flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                <Info size={14} />
                Chế độ chỉ xem
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative group flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Tìm kiếm mùa vụ..."
              className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl shrink-0 overflow-x-auto max-w-full no-scrollbar">
            {(['ALL', 'DRAFT', 'ACTIVE', 'READY_TO_HARVEST', 'HARVESTING', 'COMPLETED', 'CANCELLED'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={cn(
                  "px-4 py-1.5 text-xs font-bold rounded-lg transition-all uppercase tracking-wider whitespace-nowrap",
                  statusFilter === status 
                    ? "bg-white text-indigo-600 shadow-sm" 
                    : "text-slate-500 hover:text-slate-900 font-medium"
                )}
              >
                {status === 'ALL' ? 'Tất cả' : getStatusLabel(status)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Season Cards Grid */}
      <div className="flex-1 overflow-auto p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <Loader2 size={48} className="mb-4 animate-spin text-indigo-500" />
            <p className="text-lg font-medium">Đang tải kế hoạch...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full text-red-500">
            <p className="text-lg font-medium">Lỗi khi tải dữ liệu</p>
            <p className="text-sm">{typeof error === 'string' ? error : JSON.stringify(error)}</p>
            <Button 
               variant="outline" 
               className="mt-4 border-red-200 text-red-600 hover:bg-red-50"
               onClick={() => dispatch(fetchPlans())}
            >
              Thử lại
            </Button>
          </div>
        ) : filteredPlans.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <Calendar size={48} className="mb-4 opacity-50" />
            <p className="text-lg font-medium">Chưa có mùa vụ nào</p>
            <p className="text-sm">Tạo mùa vụ đầu tiên để bắt đầu</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPlans.map((plan) => (
              <div
                key={plan.id}
                onClick={() => navigate(`/farms/${farmId}/season-plans/${plan.id}`)}
                className="bg-white rounded-xl border border-slate-200 p-5 cursor-pointer hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-100/50 transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {plan.name}
                  </h3>
                  <div className="flex items-start gap-2">
                    <span className={cn(
                      "px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full whitespace-nowrap",
                      getStatusColor(plan.status)
                    )}>
                      {getStatusLabel(plan.status)}
                    </span>
                    {canEdit && (
                      <button
                        onClick={(e) => handleDeletePlan(e, plan.id)}
                        className="p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                        title="Xóa kế hoạch"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Calendar size={14} />
                    <span>
                      {formatDate(plan.startDate)} - {formatDate(plan.endDate)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {plan.phases.slice(0, 3).map((phase, idx) => {
                        const color = phase.status?.color || '#8b5cf6';
                        return (
                          <div
                            key={phase.id}
                            className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-bold text-white shadow-sm"
                            style={{ backgroundColor: color.startsWith('bg-') ? undefined : color }}
                          >
                            {idx + 1}
                          </div>
                        );
                      })}
                      {plan.phases.length > 3 && (
                        <div className="w-6 h-6 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[8px] font-bold text-slate-600">
                          +{plan.phases.length - 3}
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-slate-400">
                      {plan.phases.length} giai đoạn
                    </span>
                  </div>
                  <div className="text-xs font-medium text-indigo-600 group-hover:text-indigo-700 flex items-center gap-1">
                    Xem chi tiết
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CreatePlanModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreatePlan}
      />

      {/* Notification Modal */}
      <Modal 
        isOpen={notification.isOpen} 
        onClose={() => setNotification(prev => ({ ...prev, isOpen: false }))}
      >
        <div className="bg-white rounded-[32px] p-8 w-full max-w-sm overflow-hidden border border-slate-100 shadow-2xl">
          <div className="flex flex-col items-center text-center">
            <div className={cn(
              "w-20 h-20 rounded-3xl flex items-center justify-center mb-6",
              notification.type === 'success' ? "bg-emerald-50 text-emerald-500" : "bg-rose-50 text-rose-500"
            )}>
              {notification.type === 'success' ? <CheckCircle2 size={40} /> : <AlertCircle size={40} />}
            </div>
            
            <h3 className="text-xl font-black text-slate-800 tracking-tight mb-2">
              {notification.title}
            </h3>
            
            <p className="text-sm font-medium text-slate-500 mb-6 leading-relaxed">
              {notification.message}
            </p>

            {notification.details && notification.details.length > 0 && (
              <div className="w-full bg-slate-50 rounded-2xl p-4 mb-6 text-left">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Chi tiết lỗi:</p>
                <ul className="space-y-1">
                  {notification.details.map((detail, idx) => (
                    <li key={idx} className="text-xs text-rose-600 font-bold flex items-start gap-2">
                      <div className="w-1 h-1 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Button
              onClick={() => setNotification(prev => ({ ...prev, isOpen: false }))}
              className={cn(
                "w-full py-6 rounded-2xl font-black uppercase tracking-wider text-white border-none shadow-lg",
                notification.type === 'success' ? "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-100" : "bg-slate-900 hover:bg-slate-800 shadow-slate-100"
              )}
            >
              Đóng
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmModal 
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDelete}
        loading={deleteConfirm.isDeleting}
        title="Xóa kế hoạch?"
        message="Bạn có chắc chắn muốn xóa kế hoạch mùa vụ này? Mọi dữ liệu liên quan sẽ bị loại bỏ vĩnh viễn."
        confirmLabel="Xóa ngay"
        type="danger"
      />
    </div>
  );
}

export default SeasonPlanListPage;
