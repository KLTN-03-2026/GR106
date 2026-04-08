import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Trees, 
  ChevronDown, 
  Check,
  Settings,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';
import { cn } from '../../utils/cn';
import { useAuth } from '../../hooks/useAuth';
import { CreateFarmModal } from '../farm';

interface Farm {
  id: string;
  name: string;
  status: 'ACTIVE' | 'INACTIVE';
}

// Mock data for now, will call api later as per user's instruction
const mockFarms: Farm[] = [];

export default function FarmSwitcher() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleSelectFarm = (farm: Farm) => {
    setSelectedFarm(farm);
    setIsOpen(false);
    // Logic to switch farm session can be added here later
  };

  return (
    <div className="flex items-center gap-4 w-full bg-white/50 backdrop-blur-sm p-4 rounded-3xl border border-gray-100 shadow-sm mb-4">
      {/* Welcome Message */}
      <div className="flex-1">
        <h1 className="text-[22px] font-black text-gray-900 tracking-tight leading-none mb-1">
          Chào mừng trở lại, {user?.fullName.split(' ').pop()}!
        </h1>
        <p className="text-[13px] font-medium text-gray-400">
          Hôm nay trang trại của bạn đang hoạt động rất tốt.
        </p>
      </div>

      <div className="flex items-center gap-2">
        {/* Farm Selector */}
        <div className="relative">
          <button
            onClick={toggleDropdown}
            className={cn(
              "flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-100 rounded-2xl transition-all hover:bg-white hover:shadow-md active:scale-95",
              isOpen && "bg-white shadow-md ring-2 ring-emerald-500/20"
            )}
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
              <Trees size={18} />
            </div>
            <div className="text-left hidden sm:block mr-2">
              <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">
                Trang trại hiện tại
              </span>
              <span className="block text-[14px] font-black text-gray-900 leading-none">
                {selectedFarm?.name || "Chọn trang trại"}
              </span>
            </div>
            <ChevronDown size={16} className={cn("text-gray-400 transition-transform duration-300", isOpen && "rotate-180")} />
          </button>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-2 w-[280px] bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-[100]"
              >
                <div className="p-2 border-b border-gray-50 bg-gray-50/50">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">
                    Danh sách trang trại
                  </span>
                </div>
                <div className="max-h-[300px] overflow-y-auto p-2 space-y-1">
                  {mockFarms.map((farm) => (
                    <button
                      key={farm.id}
                      onClick={() => handleSelectFarm(farm)}
                      className={cn(
                        "w-full flex items-center justify-between p-3 rounded-xl transition-all hover:bg-gray-50",
                        selectedFarm?.id === farm.id && "bg-emerald-50/50 text-emerald-700"
                      )}
                    >
                      <div className="flex items-center gap-3 text-left">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          farm.status === 'ACTIVE' ? "bg-emerald-500" : "bg-gray-300"
                        )} />
                        <span className="font-bold text-sm truncate max-w-[180px]">
                          {farm.name}
                        </span>
                      </div>
                      {selectedFarm?.id === farm.id && <Check size={16} />}
                    </button>
                  ))}
                </div>
                
                <div className="p-2 border-t border-gray-50 space-y-1">
                  <button
                    onClick={() => { navigate('/farms'); setIsOpen(false); }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl text-gray-600 hover:bg-gray-50 transition-all"
                  >
                    <Settings size={18} />
                    <span className="font-bold text-sm">Quản lý trang trại</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Create New Farm Button */}
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          variant="default"
          className="h-[48px] px-6 rounded-2xl bg-[#111827] hover:bg-[#1f2937] text-white flex items-center gap-3 shadow-lg transition-all active:scale-95 hover:shadow-xl hover:-translate-y-0.5"
        >
          <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center">
            <Trees size={16} strokeWidth={3} />
          </div>
          <span className="font-bold text-[14px]">Thêm trang trại</span>
        </Button>
      </div>

      <CreateFarmModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onSuccess={() => {
          // You could add logic here to refresh farm list if needed
          console.log("Farm created successfully!");
        }}
      />
    </div>
  );
}
