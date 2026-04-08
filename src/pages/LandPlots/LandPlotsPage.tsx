import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlusIcon, LayoutGridIcon } from 'lucide-react'
import { LandPlot, PlotStatus } from '../../types/landPlot'
import { PlotFilters } from './components/PlotFilters'
import { PlotTable } from './components/PlotTable'
import { PlotCard } from './components/PlotCard'
import { CreatePlotModal } from './components/CreatePlotModal'
import { EditPlotModal } from './components/EditPlotModal'
import { DeletePlotDialog } from './components/DeletePlotDialog'

// Dữ liệu Mock ban đầu theo tài liệu PB06
const INITIAL_PLOTS: LandPlot[] = [
  {
    id: '1',
    name: 'Lô A1 - Trồng lúa',
    area: 2.5,
    status: 'active',
    description: 'Khu vực đất trũng, thích hợp trồng lúa nước',
  },
  {
    id: '2',
    name: 'Lô B2 - Vườn cây ăn trái',
    area: 1.2,
    status: 'active',
    description: 'Đang trồng xoài và bưởi',
  },
  {
    id: '3',
    name: 'Lô C1 - Đất dự phòng',
    area: 3.0,
    status: 'resting',
    description: 'Đang cải tạo đất, dự kiến trồng hoa màu vào tháng sau',
  },
]

export function LandPlotsPage() {
  const navigate = useNavigate()
  
  // State quản lý danh sách và bộ lọc
  const [plots, setPlots] = useState<LandPlot[]>(INITIAL_PLOTS)
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<PlotStatus | 'all'>('all')

  // State quản lý các Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingPlot, setEditingPlot] = useState<LandPlot | null>(null)
  const [deletingPlot, setDeletingPlot] = useState<LandPlot | null>(null)

  // Xử lý lọc dữ liệu
  const filteredPlots = useMemo(() => {
    return plots.filter((plot) => {
      const matchesSearch = plot.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
      const matchesStatus =
        statusFilter === 'all' || plot.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [plots, searchTerm, statusFilter])

  // Handlers cho CRUD
  const handleCreatePlot = (newPlotData: Omit<LandPlot, 'id'>) => {
    const newPlot: LandPlot = {
      ...newPlotData,
      id: Math.random().toString(36).substr(2, 9),
    }
    setPlots((prev) => [...prev, newPlot])
    setIsCreateModalOpen(false)
  }

  const handleEditPlot = (updatedPlot: LandPlot) => {
    setPlots((prev) =>
      prev.map((p) => (p.id === updatedPlot.id ? updatedPlot : p)),
    )
    setEditingPlot(null)
  }

  const handleDeletePlot = (plotId: string) => {
    // Soft delete implementation: Xóa khỏi danh sách hiển thị
    setPlots((prev) => prev.filter((p) => p.id !== plotId))
    setDeletingPlot(null)
  }

  const handleViewMap = (plot: LandPlot) => {
    navigate('/map', {
      state: {
        selectedPlotId: plot.id,
      },
    })
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans py-4 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm transition-all duration-300">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-100/50 rounded-2xl text-emerald-600 shadow-sm border border-emerald-200">
            <LayoutGridIcon className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Quản lý lô đất</h1>
            <p className="text-gray-500 mt-0.5 font-medium text-sm">
              Quản lý danh sách và thông tin các khu vực canh tác
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-md active:scale-95 group"
        >
          <PlusIcon className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
          Tạo lô đất mới
        </button>
      </div>

      {/* Filters Section */}
      <PlotFilters
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      {/* Content Section */}
      <div className="transition-all duration-300">
        {viewMode === 'table' ? (
          <PlotTable
            plots={filteredPlots}
            onEdit={setEditingPlot}
            onDelete={setDeletingPlot}
            onViewMap={handleViewMap}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPlots.map((plot) => (
              <PlotCard
                key={plot.id}
                plot={plot}
                onEdit={setEditingPlot}
                onDelete={setDeletingPlot}
                onViewMap={handleViewMap}
              />
            ))}
            {filteredPlots.length === 0 && (
              <div className="col-span-full bg-white rounded-2xl border border-gray-200 p-16 text-center shadow-sm">
                <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-300 border border-gray-100">
                  <LayoutGridIcon className="w-8 h-8 font-thin" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Không tìm thấy lô đất nào phù hợp</h3>
                <p className="text-gray-500 mt-1 font-medium">Thử thay đổi bộ lọc hoặc thêm một lô đất mới.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals & Dialogs */}
      <CreatePlotModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreatePlot}
        existingPlots={plots}
      />

      <EditPlotModal
        isOpen={!!editingPlot}
        onClose={() => setEditingPlot(null)}
        onSave={handleEditPlot}
        plot={editingPlot}
      />

      <DeletePlotDialog
        isOpen={!!deletingPlot}
        onClose={() => setDeletingPlot(null)}
        onConfirm={handleDeletePlot}
        plot={deletingPlot}
        hasActiveTasks={deletingPlot?.id === '1'} // Mock condition cho PB06
      />
    </div>
  )
}

export default LandPlotsPage;
