import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  FlaskConical, 
  Sparkles, 
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

interface SoilAnalysis {
  id: string;
  plotName: string;
  soilType: string;
  code: string;
  date: string;
  ph: { value: number; status: 'Thấp' | 'Vừa' | 'Cao' };
  n: { status: 'Thấp' | 'Vừa' | 'Cao' };
  p: { status: 'Thấp' | 'Vừa' | 'Cao' };
  k: { status: 'Thấp' | 'Vừa' | 'Cao' };
}

const MOCK_DATA: SoilAnalysis[] = [
  {
    id: '1',
    plotName: 'Lô A1',
    soilType: 'Đất phù sa',
    code: 'SOIL-001',
    date: '15/05/2026',
    ph: { value: 6.5, status: 'Cao' },
    n: { status: 'Cao' },
    p: { status: 'Vừa' },
    k: { status: 'Thấp' }
  },
  {
    id: '2',
    plotName: 'Lô B3',
    soilType: 'Đất thịt',
    code: 'SOIL-002',
    date: '02/05/2026',
    ph: { value: 5.8, status: 'Cao' },
    n: { status: 'Vừa' },
    p: { status: 'Thấp' },
    k: { status: 'Cao' }
  },
  {
    id: '3',
    plotName: 'Lô A2',
    soilType: 'Đất cát',
    code: 'SOIL-003',
    date: '20/04/2026',
    ph: { value: 7.2, status: 'Cao' },
    n: { status: 'Thấp' },
    p: { status: 'Cao' },
    k: { status: 'Vừa' }
  }
];

const getStatusColor = (status: 'Thấp' | 'Vừa' | 'Cao') => {
  switch (status) {
    case 'Thấp': return 'text-red-600 bg-red-50';
    case 'Vừa': return 'text-amber-600 bg-amber-50';
    case 'Cao': return 'text-emerald-600 bg-emerald-50';
    default: return 'text-slate-600 bg-slate-50';
  }
};

export const SoilProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { farmId } = useParams<{ farmId: string }>();
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="min-h-screen bg-slate-50/50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/farms/${farmId}/actions`)}
            className="p-2 hover:bg-white rounded-full transition-colors"
          >
            <ArrowLeft size={20} className="text-slate-600" />
          </button>
          <h1 className="text-xl font-bold text-slate-800">Hồ sơ đất</h1>
        </div>
        <button className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 active:scale-95 text-sm">
          <Plus size={18} />
          Phân tích mới
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex items-center gap-3 mb-8">
        <div className="relative flex-1 max-w-md group">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
          <input
            type="text"
            placeholder="Tìm kiếm hồ sơ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all text-sm"
          />
        </div>
        <button className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">
          <Filter size={18} className="text-slate-400" />
          Lọc
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_DATA.map((item) => (
          <div key={item.id} className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm hover:shadow-xl transition-all group cursor-pointer relative overflow-hidden">
            <div className="flex justify-between items-start mb-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                  <FlaskConical size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">{item.plotName}</h3>
                  <p className="text-xs text-slate-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                    {item.soilType}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{item.code}</p>
                <p className="text-[11px] font-bold text-slate-400 mt-1 flex items-center justify-end gap-1">
                  📅 {item.date}
                </p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-3 mb-8">
              {[
                { label: 'PH', val: item.ph.value, status: item.ph.status },
                { label: 'N', val: null, status: item.n.status },
                { label: 'P', val: null, status: item.p.status },
                { label: 'K', val: null, status: item.k.status },
              ].map((stat, idx) => (
                <div key={idx} className="bg-slate-50 rounded-2xl p-3 text-center">
                  <p className="text-[10px] font-bold text-slate-400 mb-1">{stat.label}</p>
                  <p className="text-sm font-black text-slate-700 mb-1">{stat.val || '--'}</p>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${getStatusColor(stat.status)}`}>
                    {stat.status}
                  </span>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-slate-50 flex items-center justify-between group/footer">
              <div className="flex items-center gap-2 text-emerald-600 font-black text-[11px] uppercase tracking-wider">
                <Sparkles size={14} className="animate-pulse" />
                AI gợi ý sẵn sàng
              </div>
              <ChevronRight size={18} className="text-slate-300 group-hover/footer:translate-x-1 group-hover/footer:text-emerald-500 transition-all" />
            </div>

            {/* Subtle Gradient background on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-emerald-50/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SoilProfilePage;
