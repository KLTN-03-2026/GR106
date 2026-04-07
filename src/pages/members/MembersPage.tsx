import { useState } from 'react'
import { UserPlus } from 'lucide-react'
import { MemberTable } from '../../components/members/MemberTable'
import { InvitationTable } from '../../components/members/InvitationTable'
import { InviteModal } from '../../components/members/InviteModal'

type Tab = 'members' | 'invitations'

export function MembersPage() {
  const [activeTab, setActiveTab] = useState<Tab>('members')
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý thành viên</h1>
        <button
          onClick={() => setIsInviteModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
        >
          <UserPlus className="w-5 h-5" />
          Mời thành viên
        </button>
      </div>

      <div className="border-b border-gray-200 mb-6">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab('members')}
            className={`pb-3 px-1 font-medium transition-colors relative ${activeTab === 'members' ? 'text-emerald-600' : 'text-gray-600 hover:text-gray-900'}`}
          >
            Thành viên
            {activeTab === 'members' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('invitations')}
            className={`pb-3 px-1 font-medium transition-colors relative ${activeTab === 'invitations' ? 'text-emerald-600' : 'text-gray-600 hover:text-gray-900'}`}
          >
            Lời mời
            {activeTab === 'invitations' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600" />
            )}
          </button>
        </div>
      </div>

      {activeTab === 'members' ? <MemberTable /> : <InvitationTable />}

      <InviteModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
      />
    </div>
  )
}
