import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { authService } from '../../services/authService';

const registerSchema = z.object({
  fullName: z.string().min(1, 'Họ tên là bắt buộc'),
  email: z.string().min(1, 'Email là bắt buộc').email('Định dạng email không hợp lệ'),
  password: z.string()
    .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
    .regex(/[A-Z]/, 'Mật khẩu phải chứa ít nhất 1 chữ hoa')
    .regex(/[0-9]/, 'Mật khẩu phải chứa ít nhất 1 số'),
  confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu'),
  farmName: z.string().min(1, 'Tên trang trại là bắt buộc'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmPassword'],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export function useRegister() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = form.handleSubmit(async (data: RegisterFormValues) => {
    // setServerError(null); // Removed to prevent UI flickering
    setIsSuccess(false);

    try {
      // payload omitting farmName as per original logic
      const payload = {
        email: data.email,
        password: data.password,
        fullName: data.fullName,
      };
      
      const response = await authService.register(payload);
      if (response.success) {
        setIsSuccess(true);
        toast.success('Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.');
      } else {
        setServerError('Có lỗi xảy ra khi đăng ký. Email có thể đã tồn tại.');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Có lỗi xảy ra khi đăng ký. Email có thể đã tồn tại.';
      setServerError(message);
    }
  });

  return {
    form,
    serverError,
    isSuccess,
    onSubmit,
  };
}
