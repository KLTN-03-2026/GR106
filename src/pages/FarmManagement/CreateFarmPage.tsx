import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Building2, 
  FileText, 
  Loader2, 
  ArrowRight,
  Sprout,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch, useSelector } from 'react-redux';

import { createFarmSchema, CreateFarmInput } from '../../schemas/farmSchemas';
import { createFarm } from '../../store/farmSlice';
import { RootState, AppDispatch } from '../../store';
import { Input } from '../../components/ui/input';
import LogoBrowser from '@/assets/Logo-browser.png';
import LoginBg from '@/assets/Login-Background.png';

export function CreateFarmPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [isSuccess, setIsSuccess] = useState(false);
  const { loading, error } = useSelector((state: RootState) => state.farm);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateFarmInput>({
    resolver: zodResolver(createFarmSchema),
    defaultValues: {
      farmName: '',
      description: '',
    }
  });

  const onSubmit = async (data: CreateFarmInput) => {
    try {
      const resultAction = await dispatch(createFarm(data));
      if (createFarm.fulfilled.match(resultAction)) {
        setIsSuccess(true);
        toast.success('Khởi tạo trang trại thành công!');
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        toast.error(typeof resultAction.payload === 'string' ? resultAction.payload : 'Có lỗi xảy ra khi tạo trang trại');
      }
    } catch (error: any) {
      toast.error('Đã xảy ra lỗi hệ thống');
    }
  };

  if (isSuccess) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-emerald-50/30">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white p-10 rounded-3xl shadow-2xl text-center space-y-6"
        >
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
            <CheckCircle2 size={48} />
          </div>
          <h1 className="text-3xl font-black text-gray-900">Tuyệt vời!</h1>
          <p className="text-gray-600 font-medium">
            Trang trại của bạn đã được khởi tạo thành công. Đang đưa bạn đến bảng điều khiển...
          </p>
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex overflow-hidden bg-white">
      {/* Left Section - Form */}
      <div className="w-full lg:w-1/2 h-full flex items-center justify-center p-6 md:p-10 relative overflow-hidden bg-white">
        {/* Logo */}
        <div className="fixed top-8 left-8 flex items-center gap-3 bg-white/80 backdrop-blur-sm p-2 rounded-lg z-50 shadow-sm border border-gray-100">
          <img src={LogoBrowser} alt="Logo" className="h-10 object-contain" />
          <span className="font-prompt font-extrabold text-[38px] leading-none bg-gradient-to-r from-emerald-800 to-emerald-500 bg-clip-text text-transparent">
            farmarAI
          </span>
        </div>

        <div className="w-full max-w-[480px] z-10 translate-y-4">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl p-8 shadow-[0_10px_40px_rgba(0,0,0,0.06)] border border-gray-50"
          >
            <div className="mb-8">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 mb-4 shadow-sm">
                <Sprout size={24} />
              </div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Thiết lập trang trại</h1>
              <p className="text-gray-500 font-medium">Chào mừng bạn đến với FarmerAI. Hãy bắt đầu bằng việc đặt tên cho không gian canh tác của bạn.</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-700 text-sm font-bold">
                <AlertCircle size={18} />
                <span>{typeof error === 'string' ? error : 'Lỗi hệ thống'}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Farm Name */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-xs font-bold text-gray-900 uppercase tracking-widest pl-1">
                  <Building2 size={14} className="text-emerald-500" />
                  Tên trang trại <span className="text-red-500">*</span>
                </label>
                <Input
                  {...register('farmName')}
                  placeholder="Ví dụ: Trang Trại Xanh"
                  className="h-12 bg-gray-50/50 border-gray-100 focus:bg-white transition-all text-base font-medium"
                />
                {errors.farmName && (
                  <span className="text-red-500 text-xs font-bold pl-1">{errors.farmName.message}</span>
                )}
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-xs font-bold text-gray-900 uppercase tracking-widest pl-1">
                  <FileText size={14} className="text-purple-500" />
                  Mô tả
                </label>
                <textarea
                  {...register('description')}
                  rows={3}
                  placeholder="Mô tả ngắn gọn về trang trại của bạn..."
                  className="w-full p-4 rounded-lg bg-gray-50/50 border border-gray-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium text-base resize-none"
                />
                {errors.description && (
                  <span className="text-red-500 text-xs font-bold pl-1">{errors.description.message}</span>
                )}
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-xl font-black text-lg shadow-lg shadow-emerald-200 hover:shadow-xl hover:shadow-emerald-300 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:hover:translate-y-0"
                >
                  {loading ? (
                    <>
                      <Loader2 size={24} className="animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      Bắt đầu ngay
                      <ArrowRight size={24} />
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>

      {/* Right Section - Image */}
      <div className="relative hidden lg:block w-1/2 h-full bg-white">
        <img 
          src={LoginBg} 
          alt="Background" 
          className="h-full w-full object-cover rounded-l-[50px] shadow-2xl" 
        />
        <div className="absolute inset-0 bg-emerald-900/10 rounded-l-[50px]" />
        
        {/* Floating Quote */}
        <div className="absolute bottom-20 left-20 right-20 bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20">
          <p className="text-white text-2xl font-black italic tracking-tight leading-snug">
            "Sức mạnh của công nghệ hiện đại mang hơi thở của đất mẹ vào từng nhịp canh tác."
          </p>
        </div>
      </div>
    </div>
  );
}

export default CreateFarmPage;
