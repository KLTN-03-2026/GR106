import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { X, UserPlus, Mail, Users, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Modal } from '../ui/Modal'
import { cn } from '../../utils/cn'
import { memberService } from '../../services/memberService'

interface InviteModalProps {
  isOpen: boolean
  onClose: () => void
}

export function InviteModal({ isOpen, onClose }: InviteModalProps) {
  const { farmId } = useParams<{ farmId: string }>()
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'manager' | 'worker'>('worker')
  const [emailError, setEmailError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateEmail = (emailArg: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(emailArg)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setEmailError('')

    if (!email.trim()) {
      setEmailError('Vui lòng nhập địa chỉ email')
      return
    }

    if (!validateEmail(email)) {
      setEmailError('Định dạng email không hợp lệ')
      return
    }

    if (!farmId) {
      toast.error('Không tìm thấy thông tin trang trại')
      return
    }

    try {
      setIsSubmitting(true)
      const res = await memberService.inviteMember(farmId, { 
        email, 
        roleId: role 
      })
      if (res.success) {
        toast.success('Đã gửi lời mời thành công đến ' + email)
        handleClose()
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi gửi lời mời')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setEmail('')
    setRole('worker')
    setEmailError('')
    setIsSubmitting(false)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="bg-white rounded-xl w-full max-w-sm overflow-hidden border border-gray-200 shadow-sm">
        {/* Header */}
        <div className="flex items-center gap-2.5 px-4 py-3 border-b border-gray-200">
          <UserPlus className="w-4 h-4 text-gray-800" />
          <span className="text-sm font-medium text-gray-900">Mời thành viên mới</span>
          <button
            onClick={handleClose}
            className="ml-auto p-1 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            <X className="w-3 h-3 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-3">
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="flex items-center gap-1.5 text-[11px] text-gray-500 mb-1.5"
            >
              <Mail className="w-3 h-3" />
              Địa chỉ email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setEmailError('')
              }}
              className={cn(
                "w-full px-3 py-2 text-sm border rounded-lg bg-gray-50 text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-all",
                emailError ? 'border-red-400 bg-red-50/30' : 'border-gray-200'
              )}
              placeholder="email@gmail.com"
            />
            {emailError && (
              <p className="mt-1.5 text-[11px] text-red-500">{emailError}</p>
            )}
          </div>

          {/* Role */}
          <div>
            <label className="text-[11px] text-gray-500 mb-1.5 block">Vai trò</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole('worker')}
                className={cn(
                  "p-3 rounded-lg border text-left transition-all duration-300",
                  role === 'worker'
                    ? "border-gray-900 bg-gray-50 opacity-100 shadow-sm"
                    : "border-gray-200 bg-white hover:border-gray-300 opacity-40 hover:opacity-100"
                )}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <Users className="w-3.5 h-3.5 text-gray-800" />
                  <span className="text-xs font-medium text-gray-900">Nhân công</span>
                </div>
                <p className="text-[10px] text-gray-400 leading-snug">
                  Chỉ xem thông tin được giao
                </p>
              </button>

              <button
                type="button"
                onClick={() => setRole('manager')}
                className={cn(
                  "p-3 rounded-lg border text-left transition-all duration-300",
                  role === 'manager'
                    ? "border-gray-900 bg-gray-50 opacity-100 shadow-sm"
                    : "border-gray-200 bg-white hover:border-gray-300 opacity-40 hover:opacity-100"
                )}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <UserPlus className="w-3.5 h-3.5 text-gray-800" />
                  <span className="text-xs font-medium text-gray-900">Quản lý</span>
                </div>
                <p className="text-[10px] text-gray-400 leading-snug">
                  Toàn quyền quản lý lô đất và nhân sự
                </p>
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-2 text-xs border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-[2] py-2 text-xs border border-gray-900 rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition-colors font-medium"
            >
              Gửi lời mời
            </button>
          </div>
        </form>
      </div>
    </Modal>
  )
}