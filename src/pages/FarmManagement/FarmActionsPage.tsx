import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Map as MapIcon, 
  Grid3X3, 
  CreditCard, 
  ArrowLeft,
  Settings,
  ShieldCheck,
  User,
  Info,
  Calendar,
  ExternalLink,
  Edit2,
  Trash2,
  Users,
  ChevronRight
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { farmService } from '../../services/farmService';
import { setAccessToken } from '../../store/authSlice';
import { fetchFarmsSummary } from '../../store/farmSlice';
import { RootState, AppDispatch } from '../../store';
import { EditFarmModal } from '../../components/farm/EditFarmModal';
import { toast } from 'sonner';
import { MemberTable } from '../../components/members/MemberTable';

const FarmActionsPage: React.FC = () => {
    const { farmId } = useParams<{ farmId: string }>();
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    
    const { farmSummary } = useSelector((state: RootState) => state.farm);
    const [activeTab, setActiveTab] = React.useState<'overview' | 'members'>('overview');

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
                navigate(path);
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
        <div className="min-h-full bg-[#F8FAFC] pb-20 no-scrollbar overflow-y-auto">
            {/* Top Navigation Bar */}
            <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                <button 
                    onClick={() => navigate('/farms')}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-all font-bold text-sm bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100"
                >
                    <ArrowLeft size={16} />
                    Quay lại
                </button>
                <div className="flex items-center gap-2 px-4 py-1.5 bg-emerald-50 rounded-full border border-emerald-100">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Hệ thống sẵn sàng</span>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 pt-8">
                {/* Header Section */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
                    <div className="flex items-center gap-6">
                        <div>
                            <div className="flex items-center gap-3 flex-wrap">
                                <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">{farm?.farmName}</h1>
                                <span className="px-3 py-1 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-[2px]">
                                    {farm?.myRole}
                                </span>
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-slate-400 text-sm font-medium">
                                <div className="flex items-center gap-1.5">
                                    <User size={14} />
                                    <span>{farm?.ownerFullName}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => setIsEditModalOpen(true)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-2xl text-slate-600 font-bold text-sm hover:border-emerald-500 hover:text-emerald-600 transition-all shadow-sm"
                        >
                            <Edit2 size={16} />
                            Chỉnh sửa
                        </button>
                    </div>
                </div>

                {/* Main Content Tabs */}
                <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-[20px] w-fit mb-8">
                    {[
                        { id: 'overview', label: 'Tổng quan', icon: <Info size={16} /> },
                        { id: 'members', label: 'Thành viên', icon: <Users size={16} /> },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-[16px] text-sm font-bold transition-all ${
                                activeTab === tab.id 
                                ? 'bg-white text-emerald-600 shadow-sm' 
                                : 'text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div>
                    {activeTab === 'overview' && (
                        <div className="space-y-8">
                            {/* Action Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {[
                                    { 
                                        title: 'Bảng điều khiển', 
                                        desc: 'Theo dõi chỉ số trực tiếp', 
                                        icon: <LayoutDashboard size={24} />, 
                                        path: '/dashboard', 
                                    },
                                    { 
                                        title: 'Bản đồ nông trại', 
                                        desc: 'Quản lý không gian GIS', 
                                        icon: <MapIcon size={24} />, 
                                        path: '/map', 
                                    },
                                    { 
                                        title: 'Lô đất & Cây trồng', 
                                        desc: 'Chi tiết canh tác từng mùa', 
                                        icon: <Grid3X3 size={24} />, 
                                        path: '/land-plots', 
                                    },
                                    { 
                                        title: 'Dịch vụ & Gói cước', 
                                        desc: 'Nâng cấp quyền hạn hệ thống', 
                                        icon: <CreditCard size={24} />, 
                                        path: '/subscription', 
                                    },
                                ].map((action, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleAction(action.path)}
                                        className="relative overflow-hidden bg-white p-6 rounded-[32px] border border-slate-200 text-left transition-all shadow-sm"
                                    >
                                        <div className="relative z-10">
                                            <div className="w-14 h-14 rounded-2xl border-2 border-slate-900 flex items-center justify-center text-slate-900 mb-6 transition-colors">
                                                {action.icon}
                                            </div>
                                            <h3 className="text-xl font-black text-slate-800 mb-2">{action.title}</h3>
                                            <p className="text-sm text-slate-500 font-medium">{action.desc}</p>
                                            <div className="mt-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-600 transition-all">
                                                Truy cập ngay
                                                <ChevronRight size={14} />
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {/* Description Card */}
                            <div className="bg-white p-8 rounded-[32px] border border-slate-200">
                                <h4 className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-[2px] mb-6">
                                    <Info size={16} className="text-emerald-500" />
                                    Giới thiệu trang trại
                                </h4>
                                <p className="text-slate-600 leading-relaxed text-sm font-medium">
                                    {farm?.description || 'Chưa cung cấp mô tả cho trang trại này. Bạn có thể cập nhật thông tin trong phần cài đặt.'}
                                </p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'members' && (
                        <div className="space-y-8">
                            <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
                                <div className="mb-8">
                                    <h2 className="text-2xl font-black text-slate-900 mb-2">Nhân sự trang trại</h2>
                                    <p className="text-sm text-slate-500 font-medium">Toàn bộ cộng sự đang đồng hành cùng {farm?.farmName}</p>
                                </div>
                                <MemberTable />
                            </div>
                        </div>
                    )}
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
