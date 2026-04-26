import { Warehouse } from '@/types/warehouse/warehouse';
import { MapPinIcon } from 'lucide-react';

interface Props {
  warehouse: Warehouse;
  isActive: boolean;
  onSelect: (wh: Warehouse) => void;
}

export function WarehouseListItem({ warehouse, isActive, onSelect }: Props) {
  return (
    <div className={`px-3 py-2.5 border-b border-gray-50 last:border-b-0 transition-all ${
      isActive ? 'bg-blue-50/80 border-l-4 border-l-blue-500' : 'bg-white hover:bg-gray-50/50'
    }`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <button
          onClick={() => onSelect(warehouse)}
          className="text-left flex-1 min-w-0"
        >
          <p className={`text-xs font-bold truncate ${isActive ? 'text-blue-900' : 'text-gray-900'}`}>
            {warehouse.name}
          </p>
          <p className="text-[10px] text-gray-400 font-medium line-clamp-1">
            {warehouse.address || 'Chưa có địa chỉ'}
          </p>
        </button>
        <div className="p-1.5 bg-blue-100 rounded-lg text-blue-600 shrink-0 shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 22H2"/><path d="M6 22V10l6-6 6 6v12"/><path d="M10 22v-4a2 2 0 0 1 4 0v4"/><path d="M2 10l10-8 10 8"/>
          </svg>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onSelect(warehouse)}
          className="text-[9px] font-bold px-2 py-1 rounded-lg border border-blue-200 text-blue-700 hover:bg-blue-50 flex items-center gap-1.5 transition-colors w-full justify-center"
        >
          <MapPinIcon className="w-2.5 h-2.5" />
          Xem vị trí kho
        </button>
      </div>
    </div>
  );
}
