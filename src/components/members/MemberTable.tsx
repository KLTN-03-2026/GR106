import { useState } from 'react'
import { MoreVertical, Users } from 'lucide-react'
import { StatusBadge } from './StatusBadge'
import { ChangeRoleModal } from './ChangeRoleModal'
import { RemoveMemberModal } from './RemoveMemberModal'

type MemberStatus = 'active' | 'pending' | 'rejected'
type MemberRole = 'owner' | 'manager' | 'worker'

interface Member {
  id: string
  name: string
  email: string
  role: MemberRole
  status: MemberStatus
  isOwner: boolean
}

export function MemberTable() {
  const [members] = useState<Member[]>([])
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [isChangeRoleModalOpen, setIsChangeRoleModalOpen] = useState(false)
  const [isRemoveMemberModalOpen, setIsRemoveMemberModalOpen] = useState(false)
  const [activeFilter, setActiveFilter] = useState<MemberStatus | 'all'>('all')

  const handleChangeRole = (member: Member) => {
    setSelectedMember(member)
    setIsChangeRoleModalOpen(true)
  }

  const handleRemoveMember = (member: Member) => {
    setSelectedMember(member)
    setIsRemoveMemberModalOpen(true)
  }

  const getRoleLabel = (role: MemberRole) => {
    const labels = {
      owner: 'Chủ trang trại',
      manager: 'Quản lý trang trại',
      worker: 'Nhân công',
    }
    return labels[role]
  }

  const filteredMembers = members.filter(
    (member) => activeFilter === 'all' || member.status === activeFilter,
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
          onClick={() => setActiveFilter('active')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeFilter === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          Đang hoạt động
        </button>
        <button
          onClick={() => setActiveFilter('pending')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeFilter === 'pending' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          Chờ chấp nhận
        </button>
        <button
          onClick={() => setActiveFilter('rejected')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeFilter === 'rejected' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          Đã từ chối
        </button>
      </div>

      {filteredMembers.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            Chưa có thành viên nào
          </h3>
          <p className="text-gray-600">
            Nhấn nút "Mời thành viên" để bắt đầu mời người tham gia trang trại
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Tên
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Vai trò
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredMembers.map((member) => (
                <tr
                  key={member.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                        <span className="text-emerald-700 font-semibold text-sm">
                          {member.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="font-medium text-gray-900">
                        {member.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{member.email}</td>
                  <td className="px-6 py-4 text-gray-900">
                    {getRoleLabel(member.role)}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={member.status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    {!member.isOwner && (
                      <div className="relative inline-block group">
                        <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                          <MoreVertical className="w-5 h-5 text-gray-600" />
                        </button>
                        <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 hidden group-hover:block z-10 transition-opacity">
                          <button
                            onClick={() => handleChangeRole(member)}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                          >
                            Thay đổi vai trò
                          </button>
                          <button
                            onClick={() => handleRemoveMember(member)}
                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                          >
                            Xóa khỏi trang trại
                          </button>
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedMember && (
        <>
          <ChangeRoleModal
            isOpen={isChangeRoleModalOpen}
            onClose={() => {
              setIsChangeRoleModalOpen(false)
              setSelectedMember(null)
            }}
            member={selectedMember}
          />
          <RemoveMemberModal
            isOpen={isRemoveMemberModalOpen}
            onClose={() => {
              setIsRemoveMemberModalOpen(false)
              setSelectedMember(null)
            }}
            member={selectedMember}
          />
        </>
      )}
    </div>
  )
}
