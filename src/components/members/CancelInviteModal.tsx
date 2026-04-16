import { useParams } from 'react-router-dom'
import { memberService } from '../../services/memberService'

interface Invitation {
  id: string
  email: string
}

interface CancelInviteModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  invitation: Invitation
}

export function CancelInviteModal({
  isOpen,
  onClose,
  onSuccess,
  invitation,
}: CancelInviteModalProps) {
  const { farmId } = useParams<{ farmId: string }>()
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!farmId) return

    try {
      setIsSubmitting(true)
      const res = await memberService.cancelInvitation(farmId, invitation.id)
      if (res.success) {
        toast.success('Đã hủy lời mời')
        if (onSuccess) onSuccess()
        onClose()
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Không thể hủy lời mời')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Hủy lời mời</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Email</p>
            <p className="font-semibold text-gray-900">{invitation.email}</p>
          </div>

          <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">
              Bạn có chắc muốn hủy lời mời này? Liên kết mời sẽ không còn hiệu
              lực.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Quay lại
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Hủy lời mời
            </button>
          </div>
        </form>
      </div>
    </Modal>
  )
}
