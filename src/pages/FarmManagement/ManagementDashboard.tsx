import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Trees,
  MapPin,
  Plus,
  ArrowLeft,
  Search,
  Loader2,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import { farmService } from '../../services/farm/farmService';
import { selectFarm, clearFarmContext } from '../../store/authSlice';
import { CreateFarmModal } from '../../components/farm';
import { fetchFarmsSummary } from '../../store/farmSlice';
import { RootState, AppDispatch } from '../../store';

export function ManagementDashboardPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { farmSummary, loading, error } = useSelector((state: RootState) => state.farm);
  
  // Tự động xóa farm context khi vào trang danh sách farm
  useEffect(() => {
    dispatch(clearFarmContext());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchFarmsSummary());
  }, [dispatch]);


  const handleSelectFarm = async (farm: any) => {
    try {
      const res = await farmService.selectFarm(farm.farmId);
      if (res.success && res.data.farmToken) {
        dispatch(selectFarm({ token: res.data.farmToken, farmId: farm.farmId }));
        navigate(`/farms/${farm.farmId}/actions`);
      }
    } catch (err: any) {
      console.error('Lỗi khi chọn farm:', err);
      toast.error(err?.response?.data?.message || 'Không thể truy cập trang trại này.');
    }
  };

  const filteredFarms = farmSummary.filter(f =>
    f.farmName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div
      className="min-h-full p-6 overflow-y-auto no-scrollbar bg-gray-50"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors bg-white border border-gray-200 text-gray-600 hover:bg-gray-100"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-gray-800">
              Quản lý trang trại
            </h1>
            <p className="text-xs mt-0.5 text-gray-500">
              Xem và điều chỉnh cấu hình các không gian canh tác của bạn
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              placeholder="Tìm kiếm trang trại..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-2 text-sm rounded-xl outline-none w-52 bg-white border border-gray-200 text-gray-700 focus:ring-2 focus:ring-green-400"
            />
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-green-500 text-white hover:bg-green-600 active:scale-95"
          >
            <Plus size={15} />
            Thêm mới
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-2xl mb-5 text-sm bg-red-50 border border-red-200 text-red-600">
          <AlertCircle size={16} />
          <span>
            Lỗi tải dữ liệu:{' '}
            {typeof error === 'string' ? error : 'Vui lòng thử lại sau'}
          </span>
        </div>
      )}

      {/* Loading */}
      {loading && farmSummary.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-green-500" />
          <p className="text-sm text-gray-500">
            Đang tải danh sách trang trại...
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFarms.map((farm) => (
            <div
              key={farm.farmId}
              onClick={() => handleSelectFarm(farm)}
              className="p-6 rounded-[32px] flex flex-col bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-green-500/5 transition-all cursor-pointer group/card relative overflow-hidden"
            >
              {/* Decorative background element */}
              {/* Top */}
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-[14px] flex items-center justify-center bg-green-100">
                  <Trees size={18} className="text-green-600" />
                </div>

                <span className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-white border border-gray-100 text-gray-600 shadow-sm">
                  {farm.myRole?.toUpperCase() === 'OWNER' ? 'Chủ sở hữu' : 'Thành viên'}
                </span>
              </div>

              <h3 className="text-[15px] font-semibold truncate text-gray-800 group-hover/card:text-green-600 transition-colors">
                {farm.farmName}
              </h3>

              <div className="flex items-center gap-1 text-xs mt-1 mb-2 text-gray-500">
                <MapPin size={11} />
                <span className="truncate">Chủ: {farm.ownerFullName}</span>
              </div>
 
              <p className="text-xs leading-relaxed line-clamp-2 mb-4 min-h-[32px] text-gray-500">
                {farm.description || 'Không có mô tả'}
              </p>


              <div className="flex items-center gap-2 mt-auto">
                <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 border border-emerald-100 bg-emerald-50 flex-1 px-3 py-1.5 rounded-full uppercase tracking-widest group-hover/card:bg-emerald-500 group-hover/card:text-white group-hover/card:border-transparent transition-all duration-300 shadow-sm shadow-emerald-100 group-hover/card:shadow-emerald-200">
                  Nhấp để xem chi tiết
                  <div>
                    <ArrowRight size={10} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <CreateFarmModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => dispatch(fetchFarmsSummary())}
      />
    </div>
  );
}

export default ManagementDashboardPage;
