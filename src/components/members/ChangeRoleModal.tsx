import React, { useState } from 'react'
import { X, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Modal } from '../ui/Modal'

interface Member {
  id: string
  name: string
  role: 'owner' | 'manager' | 'worker'
}

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
  const [newRole, setNewRole] = useState<'manager' | 'worker'>(
    member.role === 'manager' ? 'manager' : 'worker',
  )

  const getRoleLabel = (role: string) => {
    const labels = {
      owner: 'Chủ trang trại',
      manager: 'Quản lý trang trại',
      worker: 'Nhân công',
    }
    return labels[role as keyof typeof labels]
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success('Đã thay đổi vai trò thành công')
    onClose()
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
                setNewRole(e.target.value as 'manager' | 'worker')
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
            >
              Xác nhận
            </button>
          </div>
        </form>
      </div>
    </Modal>
  )
}
