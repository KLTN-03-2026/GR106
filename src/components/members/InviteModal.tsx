import React, { useState } from 'react'
import { X } from 'lucide-react'
import { toast } from 'sonner'
import { Modal } from '../ui/Modal'

interface InviteModalProps {
  isOpen: boolean
  onClose: () => void
}

export function InviteModal({ isOpen, onClose }: InviteModalProps) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'manager' | 'worker'>('worker')
  const [emailError, setEmailError] = useState('')

  const validateEmail = (emailArg: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(emailArg)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setEmailError('')

    if (!email.trim()) {
      setEmailError('Vui lòng nhập email')
      return
    }

    if (!validateEmail(email)) {
      setEmailError('Email không hợp lệ')
      return
    }

    if (email === 'owner@farm.com') {
      toast.error('Không thể mời chính mình')
      return
    }

    if (email === 'existing@farm.com') {
      toast.error('Email đã là thành viên của trang trại')
      return
    }

    toast.success('Đã gửi lời mời thành công')
    setEmail('')
    setRole('worker')
    onClose()
  }

  const handleClose = () => {
    setEmail('')
    setRole('worker')
    setEmailError('')
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Mời thành viên</h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setEmailError('')
              }}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${emailError ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="example@email.com"
            />
            {emailError && (
              <p className="mt-1.5 text-sm text-red-600">{emailError}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="role"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Vai trò
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as 'manager' | 'worker')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="worker">Nhân công</option>
              <option value="manager">Quản lý trang trại</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
            >
              Gửi lời mời
            </button>
          </div>
        </form>
      </div>
    </Modal>
  )
}
