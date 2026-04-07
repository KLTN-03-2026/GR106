import { motion } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'
import { 
  Users, 
  ClipboardList, 
  Sprout, 
  BarChart3, 
  Calendar, 
  MapPin 
} from 'lucide-react'

export function DashboardPage() {
  const { user } = useAuth()

  const getRoleLabel = () => {
    switch (user?.role) {
      case 'owner': return 'Chủ trang trại'
      case 'manager': return 'Quản lý trang trại'
      case 'employee': return 'Nhân công'
      default: return 'Thành viên'
    }
  }

  // Giao diện cho Chủ trang trại
  const renderOwnerDashboard = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="p-6 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
        <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4 text-emerald-600">
          <Users size={24} />
        </div>
        <h3 className="font-bold text-gray-900 mb-1">Quản lý Thành viên</h3>
        <p className="text-sm text-gray-500 mb-4">Mời và phân quyền cho đội ngũ của bạn.</p>
        <div className="text-2xl font-bold text-gray-900">12 Thành viên</div>
      </div>
      <div className="p-6 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 text-blue-600">
          <BarChart3 size={24} />
        </div>
        <h3 className="font-bold text-gray-900 mb-1">Báo cáo Tài chính</h3>
        <p className="text-sm text-gray-500 mb-4">Xem doanh thu và chi phí trang trại.</p>
        <div className="text-2xl font-bold text-gray-900">85% Mục tiêu</div>
      </div>
      <div className="p-6 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
        <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4 text-amber-600">
          <Sprout size={24} />
        </div>
        <h3 className="font-bold text-gray-900 mb-1">Tình trạng Vụ mùa</h3>
        <p className="text-sm text-gray-500 mb-4">Theo dõi quá trình sinh trưởng.</p>
        <div className="text-2xl font-bold text-gray-900">3 Vụ đang trồng</div>
      </div>
    </div>
  )

  // Giao diện cho Quản lý
  const renderManagerDashboard = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 text-blue-600">
          <ClipboardList size={24} />
        </div>
        <h3 className="font-bold text-gray-900 mb-1">Điều phối Công việc</h3>
        <p className="text-sm text-gray-500">Phân bổ nhiệm vụ cho nhân công hôm nay.</p>
      </div>
      <div className="p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 text-purple-600">
          <Calendar size={24} />
        </div>
        <h3 className="font-bold text-gray-900 mb-1">Lịch trình Sản xuất</h3>
        <p className="text-sm text-gray-500">Kế hoạch bón phân và thu hoạch tuần này.</p>
      </div>
    </div>
  )

  // Giao diện cho Nhân công
  const renderEmployeeDashboard = () => (
    <div className="space-y-6">
      <div className="p-6 bg-white rounded-xl border border-emerald-200 border-l-4 shadow-sm">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <ClipboardList className="text-emerald-600" size={20} />
          Nhiệm vụ của bạn hôm nay
        </h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <input type="checkbox" className="w-5 h-5 rounded text-emerald-600" />
            <span className="text-gray-700">Tưới nước khu vực A</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <input type="checkbox" className="w-5 h-5 rounded text-emerald-600" />
            <span className="text-gray-700">Kiểm tra sâu bệnh khu vực B</span>
          </div>
        </div>
      </div>
      <div className="p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
        <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
          <MapPin className="text-blue-600" size={20} />
          Vị trí làm việc
        </h3>
        <p className="text-sm text-gray-500 italic">Khu vực sản xuất trung tâm</p>
      </div>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-xl border border-emerald-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Chào mừng trở lại, {user?.fullName}!
          </h1>
          <p className="text-gray-600 text-lg">
            Bạn đang truy cập với tư cách là <span className="font-semibold text-emerald-600">{getRoleLabel()}</span>.
          </p>
        </div>
        <div className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm font-bold border border-emerald-100">
          Chi nhánh: Đà Lạt Farm
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-xl font-bold text-gray-800 mb-6 px-1">Tổng quan chức năng</h2>
        {user?.role === 'owner' && renderOwnerDashboard()}
        {user?.role === 'manager' && renderManagerDashboard()}
        {user?.role === 'employee' && renderEmployeeDashboard()}
        {!['owner', 'manager', 'employee'].includes(user?.role || '') && (
          <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300 text-gray-500">
            Tính năng đang được kích hoạt cho tài khoản của bạn.
          </div>
        )}
      </motion.div>
    </div>
  )
}
