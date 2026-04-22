import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { MoreVertical, Users, UserPlus, Loader2, Mail } from 'lucide-react'
import { memberService } from '../../services/members/memberService'
import { StatusBadge } from './StatusBadge'
import { ChangeRoleModal } from './ChangeRoleModal'
import { RemoveMemberModal } from './RemoveMemberModal'
import { InviteModal } from './InviteModal'
import { getRoleDisplayName } from '../../utils/roleUtils'
import { Member, Invitation } from '../../types/member'

type Tab = 'members' | 'invitations'

export function MemberTable() {
  const { farmId } = useParams<{ farmId: string }>()

  const [tab, setTab] = useState<Tab>('members')
  const [members, setMembers] = useState<Member[]>([])
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [isChangeRoleModalOpen, setIsChangeRoleModalOpen] = useState(false)
  const [isRemoveMemberModalOpen, setIsRemoveMemberModalOpen] = useState(false)
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [memberFilter, setMemberFilter] = useState<'all' | 'active' | 'inactive'>('all')

  const fetchMembers = async () => {
    if (!farmId) return
    setLoading(true)
    try {
      const res = await memberService.getMembers(farmId)
      if (res.success) setMembers(res.data)
    } finally {
      setLoading(false)
    }
  }

  const fetchInvitations = async () => {
    if (!farmId) return
    setLoading(true)
    try {
      const res = await memberService.getInvitations(farmId)
      if (res.success) setInvitations(res.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (tab === 'members') fetchMembers()
    else fetchInvitations()
  }, [tab])

  const handleCancelInvitation = async (invitationId: string) => {
    if (!farmId) return
    await memberService.cancelInvitation(farmId, invitationId)
    fetchInvitations()
  }

  const filteredMembers = members.filter(m =>
    memberFilter === 'all' ? true :
      memberFilter === 'active' ? m.isActive :
        !m.isActive
  )

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/50 p-4 rounded-2xl border border-slate-200">

        {/* Tabs */}
        <div className="flex gap-2">
          {[
            { id: 'members', label: 'Thành viên' },
            { id: 'invitations', label: 'Lời mời' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as Tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${tab === t.id
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200'
                : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-100'
                }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* Filter chỉ hiện ở tab members */}
          {tab === 'members' && (
            <div className="flex gap-1">
              {[
                { id: 'all', label: 'Tất cả' },
                { id: 'active', label: 'Hoạt động' },
                { id: 'inactive', label: 'Không hoạt động' },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setMemberFilter(f.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${memberFilter === f.id
                    ? 'bg-slate-800 text-white'
                    : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-100'
                    }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}

          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all text-xs font-bold active:scale-95"
          >
            <UserPlus size={14} />
            Mời thành viên
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-[24px] border border-slate-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mx-auto mb-4" />
            <p className="text-xs text-slate-500 font-medium">Đang tải...</p>
          </div>
        ) : tab === 'members' ? (

          /* ── MEMBERS TAB ── */
          filteredMembers.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-8 h-8 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-800">Chưa có thành viên</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50/50 border-b border-slate-100">
                  <tr>
                    {['Thành viên', 'Vai trò', 'Trạng thái', ''].map(h => (
                      <th key={h} className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMembers.map(member => (
                    <tr key={member.userId} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center border border-emerald-50">
                            <span className="text-emerald-700 font-bold text-sm">
                              {member.fullName?.charAt(0).toUpperCase() ?? '?'}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-800">
                              {member.fullName || 'Chưa cập nhật'}
                            </div>
                            <div className="text-[10px] text-slate-400">{member.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-medium text-slate-600">
                          {getRoleDisplayName(member.role?.name)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={member.isActive ? 'active' : 'inactive'} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        {!member.isOwner && (
                          <div className="relative inline-block group/menu">
                            <button className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                              <MoreVertical className="w-4 h-4 text-slate-400" />
                            </button>
                            <div className="absolute right-0 mt-1 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 hidden group-hover/menu:block z-10">
                              <button
                                onClick={() => { setSelectedMember(member); setIsChangeRoleModalOpen(true) }}
                                className="w-full px-4 py-2 text-left text-xs font-bold text-slate-700 hover:bg-slate-50"
                              >
                                Thay đổi vai trò
                              </button>
                              <button
                                onClick={() => { setSelectedMember(member); setIsRemoveMemberModalOpen(true) }}
                                className="w-full px-4 py-2 text-left text-xs font-bold text-rose-500 hover:bg-rose-50"
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
          )

        ) : (

          /* ── INVITATIONS TAB ── */
          invitations.length === 0 ? (
            <div className="p-12 text-center">
              <Mail className="w-8 h-8 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-800">Chưa có lời mời nào</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50/50 border-b border-slate-100">
                  <tr>
                    {['Email', 'Vai trò', 'Trạng thái', 'Hết hạn', ''].map(h => (
                      <th key={h} className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invitations.map(inv => (
                    <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center">
                            <Mail className="w-4 h-4 text-slate-400" />
                          </div>
                          <span className="text-sm font-medium text-slate-700">{inv.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-medium text-slate-600">
                          {getRoleDisplayName(inv.role?.name)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <InvitationStatusBadge status={inv.status} />
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-slate-400">
                          {new Date(inv.expiresAt).toLocaleDateString('vi-VN')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {inv.status === 'PENDING' && (
                          <button
                            onClick={() => handleCancelInvitation(inv.id)}
                            className="text-xs font-bold text-rose-500 hover:text-rose-700 px-3 py-1.5 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            Hủy
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>

      {/* Modals */}
      <InviteModal
        isOpen={isInviteModalOpen}
        onClose={() => { setIsInviteModalOpen(false); fetchMembers() }}
      />
      {selectedMember && (
        <>
          <ChangeRoleModal
            isOpen={isChangeRoleModalOpen}
            onClose={() => { setIsChangeRoleModalOpen(false); setSelectedMember(null); fetchMembers() }}
            member={selectedMember}
          />
          <RemoveMemberModal
            isOpen={isRemoveMemberModalOpen}
            onClose={() => { setIsRemoveMemberModalOpen(false); setSelectedMember(null); fetchMembers() }}
            member={selectedMember}
          />
        </>
      )}
    </div>
  )
}

// Component badge cho invitation status
function InvitationStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    PENDING: { label: 'Chờ xác nhận', className: 'bg-amber-50 text-amber-600 border-amber-100' },
    ACCEPTED: { label: 'Đã chấp nhận', className: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
    EXPIRED: { label: 'Hết hạn', className: 'bg-slate-50 text-slate-400 border-slate-100' },
    CANCELLED: { label: 'Đã hủy', className: 'bg-rose-50 text-rose-400 border-rose-100' },
  }
  const s = map[status] ?? map.EXPIRED
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold border ${s.className}`}>
      {s.label}
    </span>
  )
}