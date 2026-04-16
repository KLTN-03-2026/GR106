import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight,
  PlusCircle,
  Settings2,
  ListTree
} from 'lucide-react';

const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const adminActions = [
    {
      title: 'Quản lý danh mục cây trồng',
      description: 'Cấu hình và điều chỉnh các loại cây trồng có sẵn trong hệ thống (System Crop Types).',
      icon: ListTree,
      path: '/admin/crop-catalog',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Thêm cây trồng mới',
      description: 'Mở rộng thư viện thực vật bằng cách thêm các giống cây mới với đầy đủ thông tin chi tiết.',
      icon: PlusCircle,
      path: '/admin/crop-catalog',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Cài đặt hệ thống',
      description: 'Quản lý các tham số kỹ thuật và quy tắc phân loại cây trồng mặc định.',
      icon: Settings2,
      path: '/admin/crop-catalog',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    }
  ];

  return (
    <div className="w-full space-y-8 p-12">
      {/* Hero Banner Section - Light Sage Sync */}
      <div className="relative bg-green-50/50 rounded-[1.2rem] p-6 overflow-hidden shadow-sm border border-green-100/50 h-[100px] flex items-center">
        <div className="relative z-10 w-full flex flex-col md:flex-row items-center justify-between gap-6 px-4">
          <div className="space-y-0.5">
            <h1 className="text-xl font-black text-slate-800 tracking-tight">
              Hệ thống <span className="text-green-600 font-medium">Quản trị</span>
            </h1>
            <p className="text-[11px] text-slate-500 font-light">
              Chào mừng trở lại. Không gian điều hành danh mục nông nghiệp.
            </p>
          </div>

          <div className="flex-shrink-0">
            <div className="bg-white border border-green-100 px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex flex-col">
                <span className="text-slate-800 text-[11px] font-bold leading-none mb-0.5 tracking-tight">Hệ thống ổn định</span>
                <span className="text-[8px] text-green-600 font-bold uppercase tracking-widest">Dịch vụ hoạt động</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Header */}
      <div className="flex items-center gap-3 px-2">
        <div className="w-1 h-5 bg-green-600 rounded-full"></div>
        <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Thao tác nhanh</h2>
      </div>

      {/* Action Cards Grid - Ultra Compact */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl">
        {adminActions.map((action, index) => (
          <div
            key={index}
            onClick={() => navigate(action.path)}
            className="flex flex-col cursor-pointer bg-white border border-slate-100 rounded-xl p-4 shadow-sm"
          >
            <div className={`w-8 h-8 ${action.bgColor} rounded-lg flex items-center justify-center mb-3`}>
              <action.icon className={`w-4 h-4 ${action.color}`} />
            </div>
            
            <h3 className="text-base font-extrabold text-slate-900 mb-1 tracking-tight">
              {action.title}
            </h3>
            <p className="text-slate-400 text-[11px] leading-tight mb-4 flex-1 font-light">
              {action.description}
            </p>

            <div className="flex items-center justify-between border-t border-slate-50 pt-3">
              <div className={`flex items-center text-[9px] font-black ${action.color} gap-1.5 uppercase tracking-widest`}>
                Truy cập <ArrowRight className="w-2.5 h-2.5" />
              </div>
              <div className="w-6 h-6 border border-slate-50 rounded-full flex items-center justify-center text-slate-200">
                <ArrowRight className="w-2.5 h-2.5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* System Status Footer Card - Compact */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-6 px-2">
        <div className="flex items-center gap-5">
          <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]"></div>
          <div className="flex flex-col">
            <h2 className="text-base font-black text-slate-900 tracking-tight leading-none mb-1">Hệ thống ổn định</h2>
            <p className="text-slate-400 text-xs font-light">
              Mọi dịch vụ đang hoạt động bình thường.
            </p>
          </div>
        </div>
        
        <button 
          onClick={() => navigate('/admin/crop-catalog')}
          className="px-8 py-3.5 bg-white border border-slate-200 text-slate-900 rounded-xl text-xs font-bold shadow-sm flex items-center gap-3 active:scale-95"
        >
          <ListTree className="w-4 h-4 text-slate-400" />
          Tiếp tục quản lý
        </button>
      </div>
    </div>
  );
};

export default AdminDashboardPage;



