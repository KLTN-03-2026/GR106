import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Loader2, Mail } from 'lucide-react'
import { CancelInviteModal } from './CancelInviteModal'
import { StatusBadge } from './StatusBadge'
import type { FarmRole, Invitation } from '../../types/member'
import type { AppDispatch, RootState } from '../../store'
import { fetchInvitations as fetchInvitationsThunk } from '../../store/memberSlice'

export function InvitationTable() {
  const { farmId } = useParams<{ farmId: string }>()
  const dispatch = useDispatch<AppDispatch>()
  const { invitations, loadingInvitations: loading } = useSelector(
    (state: RootState) => state.member,
  )
  const [selectedInvitation, setSelectedInvitation] =
    useState<Invitation | null>(null)
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)
  const [activeFilter, setActiveFilter] = useState<
    'all' | 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'CANCELLED'
  >('all')

  const loadInvitations = async () => {
    if (!farmId) return
    await dispatch(fetchInvitationsThunk(farmId))
  }

  useEffect(() => {
    if (!farmId) return
    dispatch(fetchInvitationsThunk(farmId))
  }, [dispatch, farmId])

  const handleCancelInvite = (invitation: Invitation) => {
    setSelectedInvitation(invitation)
    setIsCancelModalOpen(true)
  }

  const getRoleLabel = (role: FarmRole) => {
    const name = role.name.toUpperCase()
    return name === 'MANAGER'
      ? 'Quản lý trang trại'
      : name === 'WORKER'
        ? 'Nhân công'
        : role.description || role.name
  }

  const filteredInvitations = invitations.filter(
    (inv) => activeFilter === 'all' || inv.status === activeFilter,
  )

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeFilter === 'all'
            ? 'bg-emerald-100 text-emerald-700'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
        >
          Tất cả
        </button>
        <button
          onClick={() => setActiveFilter('PENDING')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeFilter === 'PENDING'
            ? 'bg-emerald-100 text-emerald-700'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
        >
          Chờ chấp nhận
        </button>
        <button
          onClick={() => setActiveFilter('EXPIRED')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeFilter === 'EXPIRED'
            ? 'bg-emerald-100 text-emerald-700'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
        >
          Đã hết hạn
        </button>
        <button
          onClick={() => setActiveFilter('CANCELLED')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeFilter === 'CANCELLED'
            ? 'bg-emerald-100 text-emerald-700'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
        >
          Đã hủy
        </button>
        <button
          onClick={() => setActiveFilter('ACCEPTED')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeFilter === 'ACCEPTED'
            ? 'bg-emerald-100 text-emerald-700'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
        >
          Đã chấp nhận
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Đang tải danh sách lời mời...</p>
        </div>
      ) : filteredInvitations.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            Chưa có lời mời nào
          </h3>
          <p className="text-gray-600">Các lời mời bạn gửi sẽ hiển thị ở đây</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Vai trò được mời
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Hết hạn
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredInvitations.map((invitation) => (
                <tr
                  key={invitation.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 text-gray-900">
                    {invitation.email}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    <StatusBadge status={invitation.status} />
                  </td>
                  <td className="px-6 py-4">
                    {getRoleLabel(invitation.role)}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {new Date(invitation.expiresAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {invitation.status === 'PENDING' && (
                        <button
                          onClick={() => handleCancelInvite(invitation)}
                          className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          Hủy lời mời
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedInvitation && (
        <CancelInviteModal
          isOpen={isCancelModalOpen}
          onClose={() => {
            setIsCancelModalOpen(false)
            setSelectedInvitation(null)
          }}
          onSuccess={loadInvitations}
          invitation={selectedInvitation}
        />
      )}
    </div>
  )
}
