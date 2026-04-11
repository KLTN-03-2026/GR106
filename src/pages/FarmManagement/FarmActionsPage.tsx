import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Map as MapIcon, 
  Grid3X3, 
  CreditCard, 
  ArrowLeft,
  Info,
  Edit2,
  Users,
  ChevronRight,
  ArrowUpRight,
  Home,
  Clock,
  MoreHorizontal
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { farmService } from '../../services/farmService';
import { setAccessToken } from '../../store/authSlice';
import { fetchFarmsSummary } from '../../store/farmSlice';
import { RootState, AppDispatch } from '../../store';
import { EditFarmModal } from '../../components/farm/EditFarmModal';
import { toast } from 'sonner';
import { MemberCondensedList } from '../../components/members/MemberCondensedList';
import { cn } from '../../utils/cn';

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
    const [loading, setLoading] = React.useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);

    const handleAction = async (path: string) => {
        if (!farmId) return;
        setLoading(true);
        try {
            const res = await farmService.selectFarm(farmId);
            if (res.success && res.data.farmToken) {
                dispatch(setAccessToken({ token: res.data.farmToken, farmId }));
                navigate(path, { state: { confirmed: true } });
            }
        } catch (err: any) {
            console.error('Lỗi khi chọn farm:', err);
            toast.error(err?.response?.data?.message || 'Không thể truy cập chức năng này.');
        } finally {
            setLoading(false);
        }
    };

    if (!farm && !loading) {
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
                    <button 
                        onClick={() => setIsEditModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 font-black text-xs uppercase tracking-wider hover:border-emerald-500 hover:text-emerald-600 transition-all shadow-sm"
                    >
                        <Edit2 size={14} />
                        Chỉnh sửa
                    </button>
                    
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full border border-emerald-100">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Hệ thống sẵn sàng</span>
                    </div>

                    <button className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all">
                        <MoreHorizontal size={18} />
                    </button>
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

            {/* Quick Access Grid */}
            <div className="mb-12">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-6">TRUY CẬP NHANH</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { 
                            title: 'Bảng điều khiển', 
                            desc: 'Theo dõi chỉ số trực tiếp', 
                            icon: <LayoutDashboard size={24} />, 
                            path: '/dashboard',
                            color: 'bg-white text-slate-900 border-slate-900'
                        },
                        { 
                            title: 'Bản đồ nông trại', 
                            desc: 'Quản lý không gian GIS', 
                            icon: <MapIcon size={24} />, 
                            path: '/map',
                            color: 'bg-white text-slate-900 border-slate-900'
                        },
                        { 
                            title: 'Lô đất & Cây trồng', 
                            desc: 'Chi tiết canh tác từng mùa', 
                            icon: <Grid3X3 size={24} />, 
                            path: '/land-plots',
                            color: 'bg-white text-slate-900 border-slate-900'
                        },
                        { 
                            title: 'Dịch vụ & Gói cước', 
                            desc: 'Nâng cấp quyền hạn hệ thống', 
                            icon: <CreditCard size={24} />, 
                            path: '/subscription',
                            color: 'bg-white text-slate-900 border-slate-900'
                        },
                    ].map((action, i) => (
                        <button
                            key={i}
                            onClick={() => handleAction(action.path)}
                            className="group relative bg-[#F8FAFC] border border-slate-100 p-6 rounded-[32px] text-left transition-all hover:bg-white hover:border-slate-300 hover:shadow-xl hover:-translate-y-1"
                        >
                            <div className="absolute top-6 right-6 text-slate-300 group-hover:text-slate-900 transition-colors">
                                <ArrowUpRight size={20} />
                            </div>
                            
                            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-10 transition-transform group-hover:scale-110 border", action.color)}>
                                {action.icon}
                            </div>
                            
                            <h3 className="text-xl font-black text-slate-800 mb-2 leading-tight">{action.title}</h3>
                            <p className="text-xs text-slate-500 font-bold leading-relaxed mb-6">{action.desc}</p>
                            
                            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-600 group-hover:gap-3 transition-all">
                                Truy cập ngay
                                <ChevronRight size={14} />
                            </div>
                        </button>
                    ))}
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
        </div>
    );
};

export default FarmActionsPage;
