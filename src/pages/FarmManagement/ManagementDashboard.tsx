import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Trees, 
  MapPin, 
  Maximize2, 
  Users, 
  Layers, 
  Edit2,
  Trash2,
  PauseCircle,
  PlayCircle,
  Plus,
  ArrowLeft,
  Search
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { cn } from '../../utils/cn';
import { CreateFarmModal } from '../../components/farm';

interface FarmStats {
  plots: number;
  members: number;
  area: number;
}

interface Farm {
  id: string;
  name: string;
  address: string;
  description: string;
  status: 'ACTIVE' | 'INACTIVE';
  stats: FarmStats;
}

const mockFarms: Farm[] = [
  {
    id: '1',
    name: 'Trang trại Xanh Đà Lạt',
    address: 'Lạc Dương, Lâm Đồng',
    description: 'Khu vực chuyên canh dâu tây và rau ôn đới chất lượng cao.',
    status: 'ACTIVE',
    stats: { plots: 12, members: 5, area: 2.5 }
  },
  {
    id: '2',
    name: 'Vườn Ươm Công Nghệ Cao',
    address: 'Đơn Dương, Lâm Đồng',
    description: 'Hệ thống nhà màng hiện đại cho cà chua cherry.',
    status: 'ACTIVE',
    stats: { plots: 8, members: 3, area: 1.2 }
  },
  {
    id: '3',
    name: 'Trại Nấm Sạch',
    address: 'TP. Đà Lạt',
    description: 'Mô hình trồng nấm khép kín kiểm soát môi trường.',
    status: 'INACTIVE',
    stats: { plots: 4, members: 2, area: 0.5 }
  }
];

export function ManagementDashboardPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [farms] = useState<Farm[]>(mockFarms);

  const filteredFarms = farms.filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-white p-6 space-y-6 overflow-y-auto no-scrollbar">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/dashboard')}
            className="rounded-full hover:bg-gray-100"
          >
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Quản lý trang trại</h1>
            <p className="text-gray-500 font-medium">Xem và điều chỉnh cấu hình các không gian canh tác của bạn.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <Input 
              placeholder="Tìm kiếm trang trại..." 
              className="pl-10 h-11 bg-gray-50 border-gray-100 rounded-xl focus:bg-white transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button 
            onClick={() => setIsCreateModalOpen(true)}
            className="h-11 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 transition-all active:scale-95"
          >
            <Plus size={18} className="mr-2" />
            Thêm mới
          </Button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFarms.map((farm, index) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            key={farm.id}
            className="group relative bg-white border border-gray-100 rounded-[32px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300 overflow-hidden"
          >
            {/* Status Badge */}
            <div className={cn(
              "absolute top-6 right-6 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
              farm.status === 'ACTIVE' 
                ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                : "bg-gray-50 text-gray-400 border border-gray-200"
            )}>
              {farm.status === 'ACTIVE' ? 'Hoạt động' : 'Tạm ngưng'}
            </div>

            <div className="flex flex-col h-full">
              <div className="mb-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Trees size={24} />
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-1 truncate">{farm.name}</h3>
                <div className="flex items-center gap-1.5 text-gray-400 text-sm font-medium">
                  <MapPin size={14} />
                  <span className="truncate">{farm.address}</span>
                </div>
              </div>

              <p className="text-gray-500 text-sm font-medium line-clamp-2 mb-6">
                {farm.description}
              </p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 p-4 bg-gray-50/50 rounded-2xl mb-6">
                <div className="text-center">
                  <div className="flex justify-center text-emerald-600 mb-1">
                    <Layers size={16} />
                  </div>
                  <div className="text-sm font-black text-gray-900">{farm.stats.plots}</div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase">Lô đất</div>
                </div>
                <div className="text-center border-x border-gray-100">
                  <div className="flex justify-center text-blue-600 mb-1">
                    <Users size={16} />
                  </div>
                  <div className="text-sm font-black text-gray-900">{farm.stats.members}</div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase">TV viên</div>
                </div>
                <div className="text-center">
                  <div className="flex justify-center text-amber-600 mb-1">
                    <Maximize2 size={16} />
                  </div>
                  <div className="text-sm font-black text-gray-900">{farm.stats.area}</div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase">ha</div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 mt-auto">
                <Button 
                  className="flex-1 h-10 bg-gray-900 text-white rounded-xl font-bold text-xs hover:bg-gray-800 transition-all active:scale-95"
                >
                  Chi tiết
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-10 w-10 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl"
                >
                  <Edit2 size={16} />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-10 w-10 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl"
                >
                  {farm.status === 'ACTIVE' ? <PauseCircle size={16} /> : <PlayCircle size={16} />}
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-10 w-10 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Add Card Dummy */}
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="group h-full min-h-[320px] border-2 border-dashed border-gray-200 rounded-[32px] flex flex-col items-center justify-center p-6 text-gray-400 hover:border-emerald-500 hover:bg-emerald-50/10 hover:text-emerald-600 transition-all duration-300 active:scale-95"
        >
          <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4 group-hover:bg-emerald-100 transition-colors">
            <Plus size={32} />
          </div>
          <span className="font-black text-lg">Tạo trang trại mới</span>
          <p className="text-sm font-medium mt-1">Bắt đầu mở rộng quy mô canh tác</p>
        </button>
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

export default ManagementDashboardPage;
