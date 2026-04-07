import React from 'react'
import { X, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { Modal } from '../ui/Modal'

interface MemberProps {
  id: string
  name: string
}

interface RemoveMemberModalProps {
  isOpen: boolean
  onClose: () => void
  member: MemberProps
}

export function RemoveMemberModal({
  isOpen,
  onClose,
  member,
}: RemoveMemberModalProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success('Đã xóa thành viên khỏi trang trại')
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Xóa thành viên</h2>
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
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">
                Thành viên này sẽ không thể truy cập trang trại sau khi bị xóa
              </p>
            </div>

            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800">
                Các công việc đang thực hiện sẽ chuyển sang trạng thái Chưa phân
                công
              </p>
            </div>
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
              className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Xóa thành viên
            </button>
          </div>
        </form>
      </div>
    </Modal>
  )
}
