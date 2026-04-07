import { useState } from 'react'
import { Mail } from 'lucide-react'
import { StatusBadge } from './StatusBadge'
import { CancelInviteModal } from './CancelInviteModal'
import { toast } from 'sonner'

type InvitationStatus = 'pending' | 'expired' | 'cancelled' | 'accepted'

interface Invitation {
  id: string
  email: string
  role: 'manager' | 'worker'
  status: InvitationStatus
  sentDate: string
}

export function InvitationTable() {
  const [invitations] = useState<Invitation[]>([])
  const [selectedInvitation, setSelectedInvitation] =
    useState<Invitation | null>(null)
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)
  const [activeFilter, setActiveFilter] = useState<InvitationStatus | 'all'>(
    'all',
  )

  const handleCancelInvite = (invitation: Invitation) => {
    setSelectedInvitation(invitation)
    setIsCancelModalOpen(true)
  }

  const handleResendInvite = (_invitation: Invitation) => {
    toast.success('Đã gửi lại lời mời thành công')
  }

  const getRoleLabel = (role: 'manager' | 'worker') => {
    return role === 'manager' ? 'Quản lý trang trại' : 'Nhân công'
  }

  const filteredInvitations = invitations.filter(
    (inv) => activeFilter === 'all' || inv.status === activeFilter,
  )

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeFilter === 'all' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          Tất cả
        </button>
        <button
          onClick={() => setActiveFilter('pending')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeFilter === 'pending' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          Chờ chấp nhận
        </button>
        <button
          onClick={() => setActiveFilter('expired')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeFilter === 'expired' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          Đã hết hạn
        </button>
        <button
          onClick={() => setActiveFilter('cancelled')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeFilter === 'cancelled' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          Đã hủy
        </button>
        <button
          onClick={() => setActiveFilter('accepted')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeFilter === 'accepted' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          Đã chấp nhận
        </button>
      </div>

      {filteredInvitations.length === 0 ? (
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
                  Vai trò được mời
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Ngày gửi
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
                  <td className="px-6 py-4 text-gray-900">
                    {getRoleLabel(invitation.role)}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={invitation.status} />
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {invitation.sentDate}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {invitation.status === 'pending' && (
                        <button
                          onClick={() => handleCancelInvite(invitation)}
                          className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          Hủy lời mời
                        </button>
                      )}
                      {invitation.status === 'expired' && (
                        <button
                          onClick={() => handleResendInvite(invitation)}
                          className="px-3 py-1.5 text-sm text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                        >
                          Gửi lại lời mời
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
          invitation={selectedInvitation}
        />
      )}
    </div>
  )
}
