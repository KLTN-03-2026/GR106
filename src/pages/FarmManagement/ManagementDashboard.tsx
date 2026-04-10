import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Trees,
  MapPin,
  Edit2,
  Trash2,
  Plus,
  ArrowLeft,
  Search,
  Briefcase,
  CheckSquare,
  Calendar,
  DollarSign,
  Loader2,
  AlertCircle,
  CreditCard
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { CreateFarmModal } from '../../components/farm';
import { EditFarmModal } from '../../components/farm/EditFarmModal';
import { fetchFarmsSummary } from '../../store/farmSlice';
import { RootState, AppDispatch } from '../../store';
import { farmService } from '../../services/farmService';
import { setAccessToken } from '../../store/authSlice';

export function ManagementDashboardPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingFarm, setEditingFarm] = useState<any | null>(null);
  const [selectingFarmId, setSelectingFarmId] = useState<string | null>(null);

  const { farmSummary, loading, error } = useSelector((state: RootState) => state.farm);

  useEffect(() => {
    dispatch(fetchFarmsSummary());
  }, [dispatch]);

  const handleUpgrade = async (farmId: string) => {
    try {
      setSelectingFarmId(farmId);
      const res = await farmService.selectFarm(farmId);
      if (res.success && res.data.farmToken) {
        dispatch(setAccessToken({ token: res.data.farmToken, farmId }));
        navigate('/subscription');
      }
    } catch (err) {
      console.error('Lỗi khi chọn farm:', err);
      alert('Không thể khởi tạo phiên làm việc cho trang trại này.');
    } finally {
      setSelectingFarmId(null);
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

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Kế hoạch', icon: Briefcase },
          { label: 'Công việc', icon: CheckSquare },
          { label: 'Ngày công', icon: Calendar },
          { label: 'Doanh thu', icon: DollarSign },
        ].map((stat, i) => (
          <div
            key={i}
            className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm"
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3 bg-gray-100">
              <stat.icon size={16} className="text-gray-600" />
            </div>
            <div className="text-2xl font-semibold text-gray-800">
              0
            </div>
            <div className="text-xs mt-1 tracking-wider text-gray-500">
              {stat.label.toUpperCase()}
            </div>
          </div>
        ))}
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
          {filteredFarms.map((farm, index) => (
            <motion.div
              key={farm.farmId}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08, duration: 0.3 }}
              className="p-5 rounded-2xl flex flex-col bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all"
            >
              {/* Top */}
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-[14px] flex items-center justify-center bg-green-100">
                  <Trees size={18} className="text-green-600" />
                </div>

                <span className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
                  {farm.myRole?.toUpperCase() === 'OWNER' ? 'Chủ sở hữu' : 'Thành viên'}
                </span>
              </div>

              <h3 className="text-[15px] font-semibold truncate text-gray-800">
                {farm.farmName}
              </h3>

              <div className="flex items-center gap-1 text-xs mt-1 mb-2 text-gray-500">
                <MapPin size={11} />
                <span className="truncate">Chủ: {farm.ownerFullName}</span>
              </div>

              <p className="text-xs leading-relaxed line-clamp-2 mb-4 min-h-[32px] text-gray-500">
                {farm.description || 'Không có mô tả'}
              </p>

              {/* Mini stats */}
              <div className="grid grid-cols-3 rounded-xl p-2.5 mb-4 bg-gray-50 border border-gray-200">
                {['Lô đất', 'TV viên', 'ha'].map((label, i) => (
                  <div key={i} className="text-center text-[10px]">
                    <div className="text-[15px] font-semibold text-gray-800">
                      0
                    </div>
                    <div className="text-gray-500">{label}</div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-2 mb-3 mt-auto">
                <button
                  onClick={() => navigate('/map')}
                  className="py-1.5 rounded-[10px] text-[10px] font-medium bg-green-50 text-green-600 border border-green-200 hover:bg-green-100 transition-colors"
                >
                  Bản đồ
                </button>
                <button
                  onClick={() => navigate('/land-plots')}
                  className="py-1.5 rounded-[10px] text-[10px] font-medium bg-yellow-50 text-yellow-600 border border-yellow-200 hover:bg-yellow-100 transition-colors"
                >
                  Lô đất
                </button>
                <button
                  disabled={!!selectingFarmId}
                  onClick={() => handleUpgrade(farm.farmId)}
                  className="py-1.5 rounded-[10px] text-[10px] font-medium bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
                >
                  {selectingFarmId === farm.farmId ? (
                    <Loader2 size={10} className="animate-spin" />
                  ) : (
                    <CreditCard size={10} />
                  )}
                  {selectingFarmId === farm.farmId ? 'Đang chọn...' : 'Nâng cấp'}
                </button>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <span className="text-[10px] tracking-widest text-gray-400">
                  TÙY CHỌN CHUNG
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditingFarm(farm)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center bg-gray-100 text-gray-500 hover:bg-gray-200"
                  >
                    <Edit2 size={12} />
                  </button>
                  <button className="w-7 h-7 rounded-lg flex items-center justify-center bg-gray-100 text-gray-500 hover:bg-gray-200">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <CreateFarmModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => dispatch(fetchFarmsSummary())}
      />

      <EditFarmModal
        isOpen={!!editingFarm}
        onClose={() => setEditingFarm(null)}
        farm={editingFarm}
        onSuccess={() => dispatch(fetchFarmsSummary())}
      />
    </div>
  );
}

export default ManagementDashboardPage;
