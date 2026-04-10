import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { fetchFarmsSummary } from '../../store/farmSlice';
import { farmService } from '../../services/farmService';
import { Trees, ArrowRight, Loader2, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const SelectFarmForUpgrade = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { farmSummary, loading, error } = useSelector((state: RootState) => state.farm);

  useEffect(() => {
    dispatch(fetchFarmsSummary());
  }, [dispatch]);

  const handleSelectFarm = async (farmId: string) => {
    try {
      const res = await farmService.selectFarm(farmId);
      if (res.success && res.data.farmToken) {
        // Lưu farmToken riêng biệt theo yêu cầu
        localStorage.setItem('farmToken', res.data.farmToken);
        // Sau đó chuyển hướng tới trang đăng ký
        navigate('/subscription');
      }
    } catch (err) {
      console.error('Lỗi khi chọn farm:', err);
      alert('Không thể chọn trang trại này. Vui lòng thử lại.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-8"
      >
        <button 
          onClick={() => navigate('/dashboard')}
          className="mb-6 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft size={16} />
          Quay lại Dashboard
        </button>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Chọn trang trại</h1>
        <p className="text-gray-500 text-sm mb-8">
          Vui lòng chọn trang trại bạn muốn nâng cấp gói dịch vụ để tiếp tục.
        </p>

        {loading ? (
          <div className="flex flex-col items-center py-12 gap-4">
            <Loader2 className="animate-spin text-green-500 w-10 h-10" />
            <p className="text-sm text-gray-500">Đang tải danh sách trang trại...</p>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm border border-red-100 italic">
            {typeof error === 'string' ? error : 'Có lỗi xảy ra khi tải danh sách'}
          </div>
        ) : farmSummary.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500 mb-4 text-sm">Bạn chưa có trang trại nào.</p>
            <button 
              onClick={() => navigate('/farms')}
              className="px-6 py-2 bg-green-600 text-white rounded-xl font-medium"
            >
              Tạo trang trại ngay
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {farmSummary.map((farm) => (
              <button
                key={farm.farmId}
                onClick={() => handleSelectFarm(farm.farmId)}
                className="w-full flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl hover:border-green-500 hover:bg-green-50/50 transition-all group"
              >
                <div className="flex items-center gap-4 text-left">
                  <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
                    <Trees size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 text-sm leading-tight">
                      {farm.farmName}
                    </h3>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      {farm.myRole?.toUpperCase() === 'OWNER' ? 'Chủ sở hữu' : 'Thành viên'}
                    </p>
                  </div>
                </div>
                <ArrowRight size={16} className="text-gray-300 group-hover:text-green-600 transition-colors" />
              </button>
            ))}
          </div>
        )}

        <p className="mt-8 text-center text-[10px] text-gray-400">
          Hệ thống sẽ cấp mã truy cập riêng biệt cho từng trang trại để bảo mật.
        </p>
      </motion.div>
    </div>
  );
};

export default SelectFarmForUpgrade;
