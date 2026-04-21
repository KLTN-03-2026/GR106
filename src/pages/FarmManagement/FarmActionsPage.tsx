import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Info,
  Edit2,
  Users,
  Home,
  Clock,
  Trees,
  Trash2
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFarmsSummary, deleteFarm } from '../../store/farmSlice';
import { RootState, AppDispatch } from '../../store';
import { EditFarmModal } from '../../components/farm/EditFarmModal';
import { MemberCondensedList } from '../../components/members/MemberCondensedList';
import { toast } from 'sonner';
import { ConfirmModal } from '../../components/ui/ConfirmModal';

const FarmActionsPage: React.FC = () => {
    const { farmId } = useParams<{ farmId: string }>();
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    
    const { farmSummary } = useSelector((state: RootState) => state.farm);
    
    React.useEffect(() => {
        if (farmSummary.length === 0) {
            dispatch(fetchFarmsSummary());
        }
    }, [dispatch, farmSummary.length]);

    const farm = farmSummary.find(f => f.farmId === farmId);
    const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
    const [isDeleting, setIsDeleting] = React.useState(false);

    const handleDelete = async () => {
        if (!farmId) return;
        
        setIsDeleting(true);
        try {
            await dispatch(deleteFarm(farmId)).unwrap();
            toast.success("Xóa trang trại thành công");
            navigate('/farms');
        } catch (error: any) {
            toast.error(error.message || "Không thể xóa trang trại. Vui lòng thử lại sau.");
        } finally {
            setIsDeleting(false);
            setIsDeleteModalOpen(false);
        }
    };

    if (!farm) {
        return (
            <div className="p-8 text-center bg-gray-50 min-h-full flex flex-col items-center justify-center">
                <p className="text-gray-500 mb-4">Không tìm thấy thông tin trang trại này.</p>
                <button 
                    onClick={() => navigate('/farms')}
                    className="text-emerald-600 font-medium hover:underline"
                >
                    Quay lại danh sách
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-full bg-white pb-20 no-scrollbar overflow-y-auto px-8 pt-6">
            {/* Top Toolbar */}
            <div className="flex items-center justify-between mb-8">
                <button 
                    onClick={() => navigate('/farms')}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-all font-bold text-sm"
                >
                    <div className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center">
                        <ArrowLeft size={16} />
                    </div>
                    Quay lại
                </button>

                <div className="flex items-center gap-3">
                    {(farm?.owner || farm?.myRole?.toLowerCase() === 'owner') && (
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => setIsEditModalOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 font-black text-xs uppercase tracking-wider hover:border-emerald-500 hover:text-emerald-600 transition-all shadow-sm"
                            >
                                <Edit2 size={14} />
                                Chỉnh sửa
                            </button>
                            <button 
                                onClick={() => setIsDeleteModalOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-white border border-rose-100 rounded-xl text-rose-500 font-black text-xs uppercase tracking-wider hover:bg-rose-50 hover:border-rose-300 transition-all shadow-sm"
                            >
                                <Trash2 size={14} />
                                Xóa
                            </button>
                        </div>
                    )}
                    
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full border border-emerald-100">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Hệ thống sẵn sàng</span>
                    </div>

                </div>
            </div>

            {/* Profile Strip */}
            <div className="bg-white rounded-[32px] border border-slate-200 p-6 mb-10 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-5 flex-1">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                        <Home size={32} />
                    </div>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight">{farm?.farmName}</h1>
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-wider">
                                {farm?.myRole}
                            </span>
                        </div>
                        <div className="flex items-center gap-4 text-slate-400 text-xs font-bold">
                            <div className="flex items-center gap-1.5">
                                <Users size={14} />
                                <span>{farm?.ownerFullName}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl">
                    <button className="flex items-center gap-2 px-6 py-2 bg-white rounded-[14px] text-slate-800 text-sm font-black shadow-sm">
                        <Clock size={16} className="text-emerald-600" />
                        Tổng quan
                    </button>
                </div>
            </div>

            {/* Welcome Message Section */}
            <div className="flex flex-col items-center justify-center py-20 px-4 bg-slate-50/50 rounded-[48px] border border-dashed border-slate-200 mb-12 transition-all hover:bg-white hover:border-slate-300">
                <div className="w-24 h-24 rounded-[32px] bg-white shadow-sm border border-slate-100 flex items-center justify-center text-emerald-500 mb-8 transition-transform hover:scale-110 duration-500">
                    <Trees size={48} strokeWidth={1.5} />
                </div>
                
                <h2 className="text-3xl font-black text-slate-900 text-center mb-4 tracking-tight">
                    Chào mừng bạn đến với <span className="text-emerald-600">{farm?.farmName}</span>
                </h2>
                
                <p className="text-slate-500 font-bold text-center max-w-lg leading-relaxed text-sm">
                    Hãy bắt đầu với các tính năng quản lý của bạn ở thanh menu bên trái để khám phá và điều hành trang trại hiệu quả nhé.
                </p>

                <div className="mt-10 flex items-center gap-3 px-6 py-2.5 bg-white rounded-full shadow-sm border border-slate-100">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[2px]">
                        Sử dụng thanh công cụ để bắt đầu
                    </span>
                </div>
            </div>

            {/* Bottom Section - 2 Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="flex flex-col gap-6">
                    <h4 className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[2px]">
                        <Info size={14} className="text-emerald-500" />
                        GIỚI THIỆU TRANG TRẠI
                    </h4>
                    <div className="bg-slate-50 rounded-[32px] p-8 border border-slate-100 min-h-[200px]">
                        <p className="text-slate-600 leading-relaxed text-sm font-bold">
                            {farm?.description || 'Chưa cung cấp mô tả cho trang trại này.'}
                        </p>
                    </div>
                </div>

                <div className="flex flex-col gap-6">
                    <h4 className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[2px]">
                        <Users size={14} className="text-sky-500" />
                        THÀNH VIÊN
                    </h4>
                    <MemberCondensedList />
                </div>
            </div>

            <EditFarmModal 
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                farm={farm}
                onSuccess={() => dispatch(fetchFarmsSummary())}
            />

            <ConfirmModal 
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Xóa trang trại"
                message={`Bạn có chắc chắn muốn xóa trang trại "${farm?.farmName}"? Hành động này không thể hoàn tác và toàn bộ dữ liệu liên quan sẽ bị mất.`}
                confirmLabel="Vâng, hãy xóa nó"
                cancelLabel="Quay lại"
                loading={isDeleting}
                type="danger"
            />
        </div>
    );
};

export default FarmActionsPage;
