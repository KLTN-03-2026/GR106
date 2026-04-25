import { useEffect, useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Truck, Plus, Trash2, Loader2, ArrowLeft, Search, Building2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '../../hooks/auth/useAuth'
import { useSuppliers } from '../../hooks/suppliers/useSuppliers'
import { useFarms } from '../../hooks/farms/useFarms'
import { ConfirmModal } from '../../components/ui/ConfirmModal'
import { createSupplierSchema } from '../../schemas/supplierSchemas'

export function SupplierListPage() {
  const { farmId } = useParams<{ farmId: string }>()
  const navigate = useNavigate()
  const { suppliers, loading, fetchSuppliers, createSupplier, deleteSupplier } = useSuppliers()
  const { farmSummary } = useFarms()
  const { user } = useAuth()

  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newSupplier, setNewSupplier] = useState({ code: '', name: '' })
  const [submitting, setSubmitting] = useState(false)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [supplierToDelete, setSupplierToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const canManage = useMemo(() => {
    const currentFarm = farmSummary.find((f: any) => f.farmId === farmId)
    const myFarmRole = currentFarm?.myRole?.toLowerCase() || user?.role
    return ['owner', 'manager', 'admin'].includes(myFarmRole || '')
  }, [farmSummary, farmId, user])

  useEffect(() => {
    if (farmId) fetchSuppliers(farmId)
  }, [fetchSuppliers, farmId])

  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const validation = createSupplierSchema.safeParse({
      supplierCode: newSupplier.code,
      name: newSupplier.name
    })

    if (!validation.success) {
      toast.error(validation.error.errors[0].message)
      return
    }

    if (!farmId) return
    
    setSubmitting(true)
    try {
      await createSupplier(farmId, { supplierCode: newSupplier.code, name: newSupplier.name }).unwrap()
      toast.success('Đã thêm nhà cung cấp mới')
      setIsModalOpen(false)
      setNewSupplier({ code: '', name: '' })
    } catch (err: any) {
      toast.error(err || 'Không thể thêm nhà cung cấp')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteClick = (code: string) => {
    setSupplierToDelete(code)
    setIsDeleteConfirmOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!farmId || !supplierToDelete) return
    setIsDeleting(true)
    try {
      await deleteSupplier(farmId, supplierToDelete).unwrap()
      toast.success('Đã xóa nhà cung cấp')
      setIsDeleteConfirmOpen(false)
    } catch (err: any) {
      toast.error(err || 'Không thể xóa nhà cung cấp')
    } finally {
      setIsDeleting(false)
      setSupplierToDelete(null)
    }
  }

  return (
    <div className="w-full flex-1 space-y-6 font-sans py-4 animate-in fade-in duration-500 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 bg-white p-6 transition-all duration-300">
        <div className="flex items-center gap-6 w-full text-left">
          <button 
            onClick={() => navigate(`/farms/${farmId}/actions`)}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-all font-bold text-xs shrink-0"
          >
            <ArrowLeft size={14} /> Quay lại
          </button>
          <div className="h-10 w-px bg-slate-200 hidden sm:block" />
          <div className="flex items-center gap-4 flex-1">
            <div className="p-3 bg-blue-100/50 rounded-2xl text-blue-600">
              <Truck className="w-8 h-8" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Nhà cung cấp</h1>
              <p className="text-gray-500 mt-0.5 font-medium text-sm">Quản lý đối tác cung ứng vật tư</p>
            </div>
          </div>
        </div>
        {canManage && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200/50 active:scale-95 whitespace-nowrap"
          >
            <Plus size={20} /> Thêm nhà cung cấp
          </button>
        )}
      </div>

      <div className="px-6 space-y-6">
        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Tìm theo tên hoặc mã nhà cung cấp..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
          />
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
            <p className="text-xs text-slate-400 font-black uppercase tracking-widest">Đang tải dữ liệu...</p>
          </div>
        ) : filteredSuppliers.length === 0 ? (
          <div className="bg-white rounded-[32px] border border-dashed border-slate-200 py-24 flex flex-col items-center text-center">
            <Building2 className="w-12 h-12 text-slate-200 mb-4" />
            <h3 className="text-xl font-bold text-slate-800">Không tìm thấy nhà cung cấp</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredSuppliers.map((s) => (
              <div key={s.code} className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100">
                      <Building2 className="w-6 h-6 text-slate-400" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-bold text-slate-800">{s.name}</h3>
                      <p className="text-xs font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md inline-block mt-1">{s.code}</p>
                    </div>
                  </div>
                  {canManage && (
                    <button
                      onClick={() => handleDeleteClick(s.code)}
                      className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Thêm nhà cung cấp mới</h2>
              <form onSubmit={handleCreate} className="space-y-5">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Mã nhà cung cấp</label>
                  <input
                    required
                    value={newSupplier.code}
                    onChange={e => setNewSupplier(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    placeholder="VD: NCC-001"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Tên nhà cung cấp</label>
                  <input
                    required
                    value={newSupplier.name}
                    onChange={e => setNewSupplier(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="VD: Công ty TNHH ABC"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-6 py-3 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Lưu lại'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa"
        message={`Bạn có chắc chắn muốn xóa nhà cung cấp ${supplierToDelete}? Thao tác này không thể hoàn tác.`}
        confirmLabel="Xóa ngay"
        loading={isDeleting}
      />
    </div>
  )
}

export default SupplierListPage
