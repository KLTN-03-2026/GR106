import { useEffect, useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Package, Plus, Loader2, Search, Filter,
  Trash2, Edit2, AlertCircle,
  ChevronRight, Building, Tag, Layers, ArrowLeft
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '../../hooks/auth/useAuth'
import { useWarehouseItems } from '../../hooks/warehouseItems/useWarehouseItems'
import { useSuppliers } from '../../hooks/suppliers/useSuppliers'
import { useSkus } from '../../hooks/skus/useSkus'
import { useUnits } from '../../hooks/units/useUnits'
import { useWarehouses } from '../../hooks/warehouses/useWarehouses'
import { useFarms } from '../../hooks/farms/useFarms'
import { createWarehouseItemSchema } from '../../schemas/warehouseItemSchemas'
import { WarehouseItem } from '../../types/warehouseItem/warehouseItem'
import { Unit } from '../../types/unit/unit'
import { Sku } from '../../types/sku/sku'
import { Supplier } from '../../types/supplier/supplier'
import { FarmSummary } from '../../types/farm/farm'
import { extractErrorMessage } from '../../utils/errorUtils'

export function WarehouseDetailPage() {
  const { farmId, warehouseId } = useParams<{ farmId: string; warehouseId: string }>()
  const navigate = useNavigate()
  const { items, loading, fetchItems, createItem } = useWarehouseItems(farmId, warehouseId)
  const { suppliers, fetchSuppliers } = useSuppliers()
  const { skus, fetchSkus } = useSkus()
  const { units, fetchUnits } = useUnits()
  const { warehouses, fetchWarehouses } = useWarehouses()
  const { farmSummary } = useFarms()
  const { user } = useAuth()

  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const currentWarehouse = useMemo(() =>
    warehouses.find(w => w.id === warehouseId),
    [warehouses, warehouseId]
  )

  const [formData, setFormData] = useState({
    name: '',
    unitId: '',
    stock: 0,
    sku: '',
    supplierCode: '',
    unitPrice: 0,
    minStockQty: 0
  })

  const canManage = useMemo(() => {
    const currentFarm = farmSummary.find((f: FarmSummary) => f.farmId === farmId)
    const myFarmRole = currentFarm?.myRole?.toLowerCase() || user?.role
    return ['owner', 'manager', 'admin'].includes(myFarmRole || '')
  }, [farmSummary, farmId, user])

  const lowStockCount = useMemo(() =>
    items.filter((item: WarehouseItem) => item.stock <= (item.minStockQty || 0)).length,
    [items]
  )

  const totalInventoryValue = useMemo(() =>
    items.reduce((acc: number, item: WarehouseItem) => acc + (item.stock * (item.unitPrice || 0)), 0),
    [items]
  )

  useEffect(() => {
    if (farmId && warehouseId) {
      fetchItems(farmId, warehouseId)
      fetchWarehouses(farmId)
    }
  }, [fetchItems, fetchWarehouses, farmId, warehouseId])

  useEffect(() => {
    if (isModalOpen && farmId) {
      fetchSuppliers(farmId)
      fetchSkus(farmId)
      fetchUnits()
    }
  }, [isModalOpen, farmId, fetchSuppliers, fetchSkus, fetchUnits])

  const filteredItems = items.filter((item: WarehouseItem) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku.sku.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()

    const validation = createWarehouseItemSchema.safeParse(formData)
    if (!validation.success) {
      toast.error(validation.error.errors[0].message)
      return
    }

    if (!farmId || !warehouseId) return

    try {
      setIsSubmitting(true)
      await createItem(farmId, warehouseId, validation.data).unwrap()
      toast.success('Đã thêm vật tư mới')
      setIsModalOpen(false)
      setFormData({ name: '', unitId: '', stock: 0, sku: '', supplierCode: '', unitPrice: 0, minStockQty: 0 })
    } catch (err: any) {
      toast.error(extractErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full flex-1 space-y-6 font-sans py-4 animate-in fade-in duration-500 text-left bg-slate-50/30">
      {/* Breadcrumbs & Header */}
      <div className="bg-white px-8 py-6 border-b border-slate-100 shadow-sm">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
            <button onClick={() => navigate(`/farms/${farmId}/warehouses`)} className="hover:text-emerald-600 transition-colors">Kho hàng</button>
            <ChevronRight size={12} />
            <span className="text-slate-600">{currentWarehouse?.name || 'Chi tiết kho'}</span>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-5">
              <div className="p-4 bg-emerald-100/50 rounded-[24px] text-emerald-600 shadow-inner">
                <Package className="w-8 h-8" />
              </div>
              <div className="text-left">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  {currentWarehouse?.name || 'Đang tải...'}
                </h1>
                <p className="text-slate-500 font-medium text-sm mt-0.5">
                  {currentWarehouse?.address || 'Quản lý tồn kho và vật tư sản xuất'}
                </p>
              </div>
            </div>

            {canManage && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-6 py-3.5 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200/50 active:scale-95 group"
              >
                <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                Nhập vật tư mới
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="px-8 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-5">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
              <Layers size={24} />
            </div>
            <div className="text-left">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Tổng vật tư</p>
              <h3 className="text-2xl font-black text-slate-900">{items.length}</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-5">
            <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600">
              <AlertCircle size={24} />
            </div>
            <div className="text-left">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Sắp hết hàng</p>
              <h3 className="text-2xl font-black text-slate-900">{lowStockCount}</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-5">
            <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
              <Tag size={24} />
            </div>
            <div className="text-left">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Giá trị tồn kho</p>
              <h3 className="text-2xl font-black text-slate-900">{totalInventoryValue.toLocaleString('vi-VN')}</h3>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Tìm kiếm vật tư theo tên hoặc SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-[20px] text-sm focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none"
            />
          </div>
          <button className="flex items-center gap-2 px-5 py-3.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-[20px] hover:bg-slate-50 transition-all">
            <Filter size={18} />
            Bộ lọc
          </button>
        </div>

        {/* Inventory Table */}
        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-24 flex flex-col items-center gap-4">
              <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
              <p className="text-xs text-slate-400 font-black uppercase tracking-widest">Đang tải dữ liệu tồn kho...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="py-24 flex flex-col items-center text-center px-6">
              <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6">
                <Package className="w-10 h-10 text-slate-200" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Kho hàng trống</h3>
              <p className="text-sm text-slate-400 mt-2 max-w-xs mx-auto">Chưa có vật tư nào được ghi nhận trong kho này.</p>

              <button
                onClick={() => navigate(`/farms/${farmId}/warehouses`)}
                className="mt-8 flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-600 font-black rounded-2xl hover:bg-slate-200 transition-all active:scale-95 text-xs uppercase tracking-widest"
              >
                <ArrowLeft size={18} />
                Quay lại danh sách kho
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-slate-50">
                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Vật tư / SKU</th>
                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Đơn vị</th>
                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Số lượng tồn</th>
                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Nhà cung cấp</th>
                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Đơn giá (VNĐ)</th>
                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredItems.map((item: WarehouseItem) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
                            <Package size={18} />
                          </div>
                          <div className="text-left">
                            <p className="font-bold text-slate-900 text-sm">{item.name}</p>
                            <p className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded inline-block mt-1">{item.sku.sku}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold uppercase">{item.unit.name}</span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <span className={`text-sm font-black ${item.stock <= (item.minStockQty || 0) ? 'text-rose-600' : 'text-slate-900'}`}>
                          {item.stock != null ? item.stock.toLocaleString('vi-VN') : '—'}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2">
                          <Building size={14} className="text-slate-400" />
                          <span className="text-sm font-medium text-slate-600">{item.supplier.name}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <span className="text-sm font-black text-slate-900">{item.unitPrice != null ? item.unitPrice.toLocaleString('vi-VN') : '—'}</span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center justify-center gap-2">
                          <button className="p-2 text-slate-400 hover:text-emerald-600 transition-colors"><Edit2 size={16} /></button>
                          <button className="p-2 text-slate-400 hover:text-rose-600 transition-colors"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Entry Modal — compact to fit viewport */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-xl rounded-[28px] shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100 shrink-0">
              <div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">Nhập vật tư mới</h2>
                <p className="text-slate-500 font-medium text-xs mt-0.5">Điền đầy đủ thông tin để lưu vào kho</p>
              </div>
              <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600">
                <Package size={22} />
              </div>
            </div>

            {/* Scrollable form body */}
            <div className="overflow-y-auto flex-1 px-6 py-4">
              <form id="create-item-form" onSubmit={handleCreate} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Tên vật tư / Phân bón / Thuốc</label>
                    <input
                      required
                      value={formData.name}
                      onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-medium text-sm"
                      placeholder="VD: Phân bón NPK 20-20-15"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Đơn vị tính</label>
                    <select
                      required
                      value={formData.unitId}
                      onChange={e => setFormData(p => ({ ...p, unitId: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-medium text-sm"
                    >
                      <option value="">Chọn đơn vị</option>
                      {units.map((u: Unit) => <option key={u.id} value={u.id}>{u.name} ({u.code})</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Mã SKU</label>
                    <select
                      required
                      value={formData.sku}
                      onChange={e => setFormData(p => ({ ...p, sku: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-medium text-sm font-mono"
                    >
                      <option value="">Chọn mã SKU</option>
                      {skus.map((s: Sku) => <option key={s.sku} value={s.sku}>{s.sku}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Nhà cung cấp</label>
                    <select
                      value={formData.supplierCode}
                      onChange={e => setFormData(p => ({ ...p, supplierCode: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-medium text-sm"
                    >
                      <option value="">Chọn nhà cung cấp</option>
                      {suppliers.map((s: Supplier) => <option key={s.code} value={s.code}>{s.name}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Số lượng tồn ban đầu</label>
                    <input
                      type="text"
                      required
                      value={formData.stock === 0 ? '' : formData.stock.toLocaleString('vi-VN')}
                      onChange={e => {
                        const rawValue = e.target.value.replace(/\D/g, '');
                        setFormData(p => ({ ...p, stock: rawValue === '' ? 0 : Number(rawValue) }));
                      }}
                      className="w-full px-4 py-3 bg-emerald-50/30 border border-emerald-100 rounded-xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-black text-emerald-600 text-sm"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Đơn giá (VNĐ)</label>
                    <input
                      type="text"
                      value={formData.unitPrice === 0 ? '' : formData.unitPrice.toLocaleString('vi-VN')}
                      onChange={e => {
                        const rawValue = e.target.value.replace(/\D/g, '');
                        setFormData(p => ({ ...p, unitPrice: rawValue === '' ? 0 : Number(rawValue) }));
                      }}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-black text-sm"
                      placeholder="0"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Tồn kho tối thiểu (Cảnh báo)</label>
                    <input
                      type="text"
                      value={formData.minStockQty === 0 ? '' : formData.minStockQty.toLocaleString('vi-VN')}
                      onChange={e => {
                        const rawValue = e.target.value.replace(/\D/g, '');
                        setFormData(p => ({ ...p, minStockQty: rawValue === '' ? 0 : Number(rawValue) }));
                      }}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-black text-rose-600 text-sm"
                      placeholder="0"
                    />
                  </div>
                </div>
              </form>
            </div>

            {/* Sticky footer buttons */}
            <div className="flex gap-3 px-6 py-4 border-t border-slate-100 shrink-0">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 px-6 py-3 border-2 border-slate-100 text-slate-500 font-black rounded-xl hover:bg-slate-50 transition-all uppercase tracking-widest text-xs"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                form="create-item-form"
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-emerald-600 text-white font-black rounded-xl hover:bg-emerald-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-widest text-xs shadow-lg shadow-emerald-200"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                  <>
                    <Plus size={16} />
                    Xác nhận nhập kho
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default WarehouseDetailPage