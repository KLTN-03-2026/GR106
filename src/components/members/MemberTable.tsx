import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { MoreVertical, Users, UserPlus, Loader2 } from 'lucide-react'
import { memberService } from '../../services/members/memberService'
import { StatusBadge } from './StatusBadge'
import { ChangeRoleModal } from './ChangeRoleModal'
import { RemoveMemberModal } from './RemoveMemberModal'
import { getRoleDisplayName } from '../../utils/roleUtils'
import { InviteModal } from './InviteModal'
import { Member, MemberStatus, MemberRole } from '../../types/member'

export function MemberTable() {
  const { farmId } = useParams<{ farmId: string }>()
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [isChangeRoleModalOpen, setIsChangeRoleModalOpen] = useState(false)
  const [isRemoveMemberModalOpen, setIsRemoveMemberModalOpen] = useState(false)
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [activeFilter, setActiveFilter] = useState<MemberStatus | 'all'>('all')

  const fetchMembers = async () => {
    if (!farmId) return
    try {
      setLoading(true)
      const res = await memberService.getMembers(farmId)
      if (res.success) {
        setMembers(res.data)
      }
    } catch (err: any) {
      console.error('Error fetching members:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMembers()
  }, [])

  const handleChangeRole = (member: Member) => {
    setSelectedMember(member)
    setIsChangeRoleModalOpen(true)
  }

  const handleRemoveMember = (member: Member) => {
    setSelectedMember(member)
    setIsRemoveMemberModalOpen(true)
  }

  const getRoleLabel = (role: MemberRole) => {
    return getRoleDisplayName(role)
  }

  const filteredMembers = members.filter(
    (member) => activeFilter === 'all' || member.status === activeFilter,
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/50 p-4 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'Tất cả' },
            { id: 'active', label: 'Hoạt động' },
            { id: 'pending', label: 'Đang chờ' },
          ].map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeFilter === filter.id 
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200' 
                  : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-100'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
        
        <button
          onClick={() => setIsInviteModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all text-xs font-bold active:scale-95"
        >
          <UserPlus size={14} />
          Mời thành viên
        </button>
      </div>

      <div className="bg-white rounded-[24px] border border-slate-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mx-auto mb-4" />
            <p className="text-xs text-slate-500 font-medium">Đang tải danh sách thành viên...</p>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
              <Users className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 mb-1">
              Chưa có thành viên nào
            </h3>
            <p className="text-xs text-slate-400 max-w-[200px] mx-auto">
              Hãy bắt đầu bằng cách mời cộng sự tham gia trang trại của bạn.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Thành viên
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Vai trò
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Trạng thái
                  </th>
                  <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMembers.map((member) => (
                  <tr
                    key={member.id}
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center border border-emerald-50">
                          <span className="text-emerald-700 font-bold text-sm">
                            {member.name ? member.name.charAt(0).toUpperCase() : '?'}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-800">
                            {member.name || 'Người dùng chưa cập nhật'}
                          </div>
                          <div className="text-[10px] text-slate-400">{member.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium text-slate-600">
                        {getRoleLabel(member.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={member.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      {!member.isOwner && (
                        <div className="relative inline-block group/menu">
                          <button className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                            <MoreVertical className="w-4 h-4 text-slate-400" />
                          </button>
                          <div className="absolute right-0 mt-1 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 hidden group-hover/menu:block z-10 transition-all">
                            <button
                              onClick={() => handleChangeRole(member)}
                              className="w-full px-4 py-2 text-left text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                              Thay đổi vai trò
                            </button>
                            <button
                              onClick={() => handleRemoveMember(member)}
                              className="w-full px-4 py-2 text-left text-xs font-bold text-rose-500 hover:bg-rose-50 transition-colors"
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
      </div>

      <InviteModal
        isOpen={isInviteModalOpen}
        onClose={() => {
          setIsInviteModalOpen(false)
          fetchMembers()
        }}
      />

      {selectedMember && (
        <>
          <ChangeRoleModal
            isOpen={isChangeRoleModalOpen}
            onClose={() => {
              setIsChangeRoleModalOpen(false)
              setSelectedMember(null)
              fetchMembers()
            }}
            member={selectedMember}
          />
          <RemoveMemberModal
            isOpen={isRemoveMemberModalOpen}
            onClose={() => {
              setIsRemoveMemberModalOpen(false)
              setSelectedMember(null)
              fetchMembers()
            }}
            member={selectedMember}
          />
        </>
      )}
    </div>
  )
}
