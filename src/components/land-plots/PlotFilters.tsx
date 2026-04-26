import { SearchIcon, FilterIcon, LayoutGridIcon, ListIcon } from 'lucide-react'

interface PlotFiltersProps {
  viewMode: 'table' | 'card'
  onViewModeChange: (mode: 'table' | 'card') => void
  searchTerm: string
  onSearchChange: (term: string) => void
  statusFilter: string | 'all'
  onStatusFilterChange: (status: string | 'all') => void
}

export function PlotFilters({
  viewMode,
  onViewModeChange,
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
}: PlotFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-transparent px-6 py-4 mb-2 font-sans">
      <div className="flex flex-1 items-center gap-4 w-full sm:w-auto">
        <div className="relative flex-1 sm:max-w-xs">
          <SearchIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên lô..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
          />
        </div>

        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) =>
              onStatusFilterChange(e.target.value)
            }
            className="appearance-none pl-10 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-gray-700 font-medium"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="ACTIVE">Đang hoạt động</option>
            <option value="INACTIVE">Ngưng hoạt động</option>
          </select>
          <FilterIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      <div className="flex items-center bg-gray-100 p-1 rounded-lg font-sans">
        <button
          onClick={() => onViewModeChange('table')}
          className={`p-1.5 rounded-md transition-all ${viewMode === 'table' ? 'bg-white text-emerald-700' : 'text-gray-500 hover:text-gray-700'}`}
          title="Xem dạng bảng"
        >
          <ListIcon className="w-4 h-4" />
        </button>
        <button
          onClick={() => onViewModeChange('card')}
          className={`p-1.5 rounded-md transition-all ${viewMode === 'card' ? 'bg-white text-emerald-700' : 'text-gray-500 hover:text-gray-700'}`}
          title="Xem dạng thẻ"
        >
          <LayoutGridIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
