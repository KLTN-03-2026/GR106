import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trees, 
  MapPin, 
  FileText, 
  Loader2, 
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

const farmEditSchema = z.object({
  name: z.string().min(1, 'Tên trang trại là bắt buộc').max(100, 'Tên không quá 100 ký tự'),
  address: z.string().optional(),
  description: z.string().optional(),
});

type FarmEditFormValues = z.infer<typeof farmEditSchema>;

interface EditFarmModalProps {
  isOpen: boolean;
  onClose: () => void;
  farm: any | null; // will replace with Farm type later
  onSuccess?: () => void;
}

export function EditFarmModal({ isOpen, onClose, farm }: EditFarmModalProps) {

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FarmEditFormValues>({
    resolver: zodResolver(farmEditSchema),
    defaultValues: {
      name: '',
      address: '',
      description: '',
    }
  });

  useEffect(() => {
    if (farm && isOpen) {
      reset({
        name: farm.name || '',
        address: farm.address || '',
        description: farm.description || '',
      });
    }
  }, [farm, isOpen, reset]);

  const onSubmit = async (_data: FarmEditFormValues) => {
    try {
      // NOTE: The provided API specification does not yet include an endpoint for updating farms.
      // This will be implemented once the backend supports POST/PUT /api/v1/farm/{id} or similar.
      toast.info('Tính năng cập nhật trang trại đang được phát triển theo tài liệu API mới nhất.');
      onClose();
    } catch (error: any) {
      toast.error('Đã xảy ra lỗi hệ thống');
    }
  };

  if (!farm) return null;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] overflow-y-auto">
          <div className="flex min-h-full items-start justify-center p-4 py-12 sm:py-20">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isSubmitting && onClose()}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-[520px] bg-white rounded-[32px] overflow-hidden shadow-2xl my-8 pointer-events-auto"
            >
              <>
                <div className="p-8 pb-0 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm">
                      <Trees size={24} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-gray-900 tracking-tight">Chỉnh sửa trang trại</h2>
                      <p className="text-gray-400 text-sm font-medium">Cập nhật thông tin cho trang trại</p>
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
                      className="flex-[2] h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-lg shadow-lg shadow-blue-200 transition-all active:scale-95 disabled:opacity-70"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center gap-2">
                          <Loader2 size={20} className="animate-spin" />
                          <span>Đang xử lý</span>
                        </div>
                      ) : (
                        "Lưu thay đổi"
                      )}
                    </Button>
                  </div>
                </form>
              </>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
