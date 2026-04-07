import { AlertCircle } from 'lucide-react'

export function InviteExpiredPage() {
  return (
    <div className="w-full min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-amber-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Lời mời đã hết hạn
        </h1>
        <p className="text-gray-600">
          Vui lòng liên hệ chủ trang trại để được gửi lại lời mời
        </p>
      </div>
    </div>
  )
}
