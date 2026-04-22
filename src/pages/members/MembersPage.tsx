import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { ArrowLeft } from 'lucide-react'

import { MemberTable } from '../../components/members/MemberTable'

export function MembersPage() {
  const navigate = useNavigate()
  const { currentFarmId } = useSelector((state: RootState) => state.auth)

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

      <MemberTable />
    </div>
  )
}