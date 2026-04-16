import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { X, AlertCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Modal } from '../ui/Modal'
import { memberService } from '../../services/memberService'
import { Member, MemberRole } from '../../types/member'

interface ChangeRoleModalProps {
  isOpen: boolean
  onClose: () => void
  member: Member
}

export function ChangeRoleModal({
  isOpen,
  onClose,
  member,
}: ChangeRoleModalProps) {
  const { farmId } = useParams<{ farmId: string }>()
  const [newRole, setNewRole] = useState<MemberRole>(
    (member.role === 'manager' || member.role === 'worker') ? member.role : 'worker',
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  const getRoleLabel = (role: string) => {
    const labels = {
      owner: 'Chủ trang trại',
      manager: 'Quản lý trang trại',
      worker: 'Nhân công',
      employee: 'Nhân công',
    }
    return labels[role as keyof typeof labels] || role
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!farmId) return

    try {
      setIsSubmitting(true)
      const res = await memberService.changeRole(farmId, member.id, { role: newRole })
      if (res.success) {
        toast.success('Đã thay đổi vai trò thành công')
        onClose()
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi thay đổi vai trò')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Thay đổi vai trò</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Thành viên</p>
            <p className="font-semibold text-gray-900">{member.name}</p>
            <p className="text-sm text-gray-600 mt-2">Vai trò hiện tại</p>
            <p className="font-medium text-gray-900">
              {getRoleLabel(member.role)}
            </p>
          </div>

          <div>
            <label
              htmlFor="newRole"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Vai trò mới
            </label>
            <select
              id="newRole"
              value={newRole}
              onChange={(e) =>
                setNewRole(e.target.value as MemberRole)
              }
              disabled={isSubmitting}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
            >
              <option value="worker">Nhân công</option>
              <option value="manager">Quản lý trang trại</option>
            </select>
          </div>

          <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">
              Thay đổi vai trò sẽ ảnh hưởng đến quyền truy cập của thành viên
              này
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang xử lý...</span>
                </>
              ) : (
                'Xác nhận'
              )}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  )
}
