import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { ArrowLeft } from 'lucide-react'

import { MemberTable } from '../../components/members/MemberTable'
import { InvitationTable } from '../../components/members/InvitationTable'
import { InviteModal } from '../../components/members/InviteModal'

type Tab = 'members' | 'invitations'

export function MembersPage() {
  const navigate = useNavigate()
  const { currentFarmId } = useSelector((state: RootState) => state.auth)
  const [activeTab, setActiveTab] = useState<Tab>('members')
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)

  return (
    <div className="w-full px-6 pt-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={() => navigate(`/farms/${currentFarmId}/actions`)}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-all font-bold text-xs shrink-0"
        >
          <div className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center bg-white shadow-sm hover:shadow-md transition-all">
            <ArrowLeft size={14} />
          </div>
          Quay lại
        </button>
        <div className="h-8 w-px bg-slate-200 mx-1" />
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Quản lý thành viên</h1>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6 pl-1">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab('members')}
            className={`pb-3 px-1 text-sm font-medium transition-colors relative ${
              activeTab === 'members' ? 'text-emerald-600' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Thành viên
            {activeTab === 'members' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('invitations')}
            className={`pb-3 px-1 text-sm font-medium transition-colors relative ${
              activeTab === 'invitations' ? 'text-emerald-600' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Lời mời
            {activeTab === 'invitations' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'members' ? <MemberTable /> : <InvitationTable />}

      <InviteModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
      />
    </div>
  )
}