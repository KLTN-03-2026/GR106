import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { 
  LayoutDashboard, 
  Map as MapIcon, 
  Grid3X3, 
  CreditCard, 
  Settings2, 
  X,
  Loader2,
  ArrowRight,
  Trash2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { farmService } from '../../services/farmService';
import { setAccessToken } from '../../store/authSlice';
import { useState } from 'react';

interface FarmQuickActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  farm: {
    farmId: string;
    farmName: string;
    description: string;
  } | null;
  onEdit: (farm: any) => void;
  onDelete: (farmId: string) => void;
}

export function FarmQuickActionsModal({ isOpen, onClose, farm, onEdit, onDelete }: FarmQuickActionsModalProps) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  if (!farm) return null;

  const handleAction = async (actionId: string, path: string) => {
    setLoadingAction(actionId);
    try {
      const res = await farmService.selectFarm(farm.farmId);
      if (res.success && res.data.farmToken) {
        dispatch(setAccessToken({ token: res.data.farmToken, farmId: farm.farmId }));
        onClose();
        navigate(path, { state: { confirmed: true } });
      }
    } catch (err) {
      console.error('Action error:', err);
    } finally {
      setLoadingAction(null);
    }
  };

  const actions = [
    {
      id: 'dashboard',
      name: 'Bảng điều khiển',
      desc: 'Tổng quan & Điều khiển trung tâm',
      icon: LayoutDashboard,
      color: 'bg-emerald-500',
      path: '/dashboard'
    },
    {
      id: 'map',
      name: 'Bản đồ số',
      desc: 'Quản lý tọa độ & Ranh giới',
      icon: MapIcon,
      color: 'bg-blue-500',
      path: '/map'
    },
    {
      id: 'plots',
      name: 'Lô đất & Cây trồng',
      desc: 'Quản lý chi tiết mảnh vườn',
      icon: Grid3X3,
      color: 'bg-orange-500',
      path: '/land-plots'
    },
    {
      id: 'upgrade',
      name: 'Nâng cấp gói',
      desc: 'Mở rộng tính năng & Giới hạn',
      icon: CreditCard,
      color: 'bg-purple-500',
      path: '/subscription'
    }
  ];

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-[560px] bg-white rounded-[32px] shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-8 pb-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50/50 to-white">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm">
                  <span className="text-xl font-black">AI</span>
                </div>
                <div>
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight leading-none mb-2">
                    {farm.farmName}
                  </h2>
                  <p className="text-xs text-gray-400 font-medium tracking-wide uppercase italic">
                    Trung tâm điều hành trang trại
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Grid Actions */}
            <div className="p-8 grid grid-cols-2 gap-4">
              {actions.map((action) => (
                <button
                  key={action.id}
                  disabled={!!loadingAction}
                  onClick={() => handleAction(action.id, action.path)}
                  className="group relative flex flex-col p-5 rounded-3xl bg-gray-50 border border-gray-100 hover:border-emerald-500 hover:bg-white hover:shadow-xl hover:shadow-emerald-500/10 transition-all text-left disabled:opacity-50 overflow-hidden"
                >
                  <div className={`w-12 h-12 ${action.color} rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                    {loadingAction === action.id ? <Loader2 size={24} className="animate-spin" /> : <action.icon size={24} />}
                  </div>
                  <h3 className="font-black text-gray-800 text-base mb-1 group-hover:text-emerald-600 transition-colors">
                    {action.name}
                  </h3>
                  <p className="text-[11px] text-gray-400 font-medium leading-relaxed line-clamp-2">
                    {action.desc}
                  </p>
                  
                  <div className="absolute bottom-4 right-4 opacity-0 transform translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-emerald-500">
                    <ArrowRight size={16} />
                  </div>
                </button>
              ))}
            </div>

            {/* Footer Quick Actions */}
            <div className="px-8 py-6 bg-gray-50 flex items-center justify-between border-t border-gray-100">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Cấu hình hệ thống</p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onClose();
                    onEdit(farm);
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-600 text-xs font-bold hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 transition-all shadow-sm"
                >
                  <Settings2 size={14} />
                  Sửa thông tin
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('Bạn có chắc chắn muốn xóa trang trại này?')) {
                      onDelete(farm.farmId);
                      onClose();
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-red-500 text-xs font-bold hover:bg-red-50 hover:border-red-200 transition-all shadow-sm"
                >
                  <Trash2 size={14} />
                  Xóa
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
