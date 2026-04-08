import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trees, 
  MapPin, 
  Maximize2, 
  FileText, 
  Loader2, 
  X,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { farmService, CreateFarmRequest } from '../../services/farmService';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';

const farmSchema = z.object({
  name: z.string().min(1, 'Tên trang trại là bắt buộc').max(100, 'Tên không quá 100 ký tự'),
  address: z.string().optional(),
  totalArea: z.string().refine((val) => !val || (!isNaN(Number(val)) && Number(val) > 0), {
    message: 'Diện tích phải là số dương',
  }).optional(),
  description: z.string().optional(),
});

type FarmFormValues = z.infer<typeof farmSchema>;

interface CreateFarmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateFarmModal({ isOpen, onClose, onSuccess }: CreateFarmModalProps) {
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FarmFormValues>({
    resolver: zodResolver(farmSchema),
  });

  const onSubmit = async (data: FarmFormValues) => {
    try {
      const payload: CreateFarmRequest = {
        name: data.name,
        address: data.address,
        totalArea: data.totalArea ? Number(data.totalArea) : undefined,
        description: data.description,
      };

      const response = await farmService.createFarm(payload);
      if (response.success) {
        setIsSuccess(true);
        toast.success('Khởi tạo trang trại thành công!');
        setTimeout(() => {
          setIsSuccess(false);
          reset();
          onClose();
          if (onSuccess) onSuccess();
        }, 2000);
      } else {
        toast.error(response.message || 'Có lỗi xảy ra');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Đã xảy ra lỗi hệ thống');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !isSubmitting && onClose()}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-[520px] bg-white rounded-[32px] overflow-hidden shadow-2xl"
          >
            {isSuccess ? (
              <div className="p-10 text-center space-y-6">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600"
                >
                  <CheckCircle2 size={48} />
                </motion.div>
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">Tuyệt vời!</h2>
                <p className="text-gray-500 font-medium">
                  Trang trại của bạn đã được khởi tạo thành công. Đang cập nhật dữ liệu...
                </p>
                <div className="flex justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                </div>
              </div>
            ) : (
              <>
                <div className="p-8 pb-0 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm">
                      <Trees size={24} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-gray-900 tracking-tight">Thêm trang trại mới</h2>
                      <p className="text-gray-400 text-sm font-medium">Khởi tạo không gian canh tác của bạn</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="rounded-full hover:bg-gray-100"
                  >
                    <X size={20} />
                  </Button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-5">
                  {/* Farm Name */}
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">
                      Tên trang trại <span className="text-red-500">*</span>
                    </label>
                    <Input
                      {...register('name')}
                      placeholder="Ví dụ: Trang Trại Xanh"
                      className="h-12 bg-gray-50 border-gray-100 focus:bg-white transition-all text-base font-medium rounded-xl"
                    />
                    {errors.name && (
                      <span className="text-red-500 text-[10px] font-bold pl-1 uppercase tracking-wider">{errors.name.message}</span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Total Area */}
                    <div className="space-y-1.5">
                      <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">
                        Diện tích (ha)
                      </label>
                      <div className="relative">
                        <Maximize2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <Input
                          {...register('totalArea')}
                          placeholder="Ví dụ: 2.5"
                          className="h-12 pl-10 bg-gray-50 border-gray-100 focus:bg-white transition-all text-base font-medium rounded-xl"
                        />
                      </div>
                      {errors.totalArea && (
                        <span className="text-red-500 text-[10px] font-bold pl-1 uppercase tracking-wider">{errors.totalArea.message}</span>
                      )}
                    </div>

                    {/* Address Placeholder or Status */}
                    <div className="space-y-1.5">
                      <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">
                        Trạng thái mặc định
                      </label>
                      <div className="h-12 flex items-center px-4 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-700 font-bold text-xs gap-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        Hoạt động
                      </div>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">
                      Địa chỉ
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <Input
                        {...register('address')}
                        placeholder="Nhập địa chỉ trang trại"
                        className="h-12 pl-10 bg-gray-50 border-gray-100 focus:bg-white transition-all text-base font-medium rounded-xl"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">
                      Mô tả ngắn
                    </label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-3 text-gray-400" size={16} />
                      <textarea
                        {...register('description')}
                        rows={3}
                        placeholder="Kể về trang trại của bạn..."
                        className="w-full pl-10 p-3 rounded-xl bg-gray-50 border border-gray-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium text-base resize-none"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex gap-3">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={onClose}
                      disabled={isSubmitting}
                      className="flex-1 h-12 rounded-xl font-bold text-gray-500 hover:bg-gray-50"
                    >
                      Hủy bỏ
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-[2] h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-lg shadow-lg shadow-emerald-200 transition-all active:scale-95 disabled:opacity-70"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center gap-2">
                          <Loader2 size={20} className="animate-spin" />
                          <span>Đang xử lý</span>
                        </div>
                      ) : (
                        "Tạo trang trại"
                      )}
                    </Button>
                  </div>
                </form>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
