import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'sonner';
import { authService } from '../../services/authService';
import { setCredentials } from '../../store/authSlice';

const loginSchema = z.object({
  email: z.string().min(1, 'Email là bắt buộc').email('Định dạng email không hợp lệ'),
  password: z.string().min(1, 'Mật khẩu là bắt buộc'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function useLogin() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const handleFailedAttempt = () => {
    const newAttempts = failedAttempts + 1;
    setFailedAttempts(newAttempts);
    if (newAttempts >= 5) {
      setIsLocked(true);
      const lockMessage = 'Tài khoản bị khóa tạm thời do đăng nhập sai nhiều lần. Vui lòng thử lại sau 15 phút.';
      setServerError(lockMessage);
      
      setTimeout(() => {
        setIsLocked(false);
        setFailedAttempts(0);
        setServerError(null);
      }, 15 * 60 * 1000);
    }
  };

  const onSubmit = form.handleSubmit(async (data: LoginFormValues) => {
    if (isLocked) {
      toast.error('Tài khoản đang bị khóa');
      return;
    }

    // setServerError(null); (Removed to prevent UI flickering)
    try {
      const response = await authService.login(data);
      if (response.success) {
        dispatch(setCredentials(response.data));
        toast.success('Đăng nhập thành công');
        navigate('/dashboard');
      } else {
        handleFailedAttempt();
        setServerError('Email hoặc mật khẩu không đúng');
      }
    } catch (error: any) {
      handleFailedAttempt();
      
      let message = error.response?.data?.message;
      // Ghi đè các thông báo lỗi chung chung của server bằng thông báo thân thiện
      if (!message || message.toLowerCase().includes('unauthorized') || message.toLowerCase().includes('chưa đăng nhập')) {
        message = 'Email hoặc mật khẩu không đúng';
      }
      
      setServerError(message);
    }
  });

  return {
    form,
    serverError,
    onSubmit,
  };
}
