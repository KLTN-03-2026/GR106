import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginSchema } from '../../schemas/authSchemas';
import { authService } from '../../services/authService';
import { loginSuccess } from '../../store/authSlice';
import { LoginInput } from '../../types/auth';

export function useLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = form.handleSubmit(async (data: LoginInput) => {
    setServerError(null);
    try {
      const response = await authService.login(data);
      if (response.success && response.data.accessToken) {
        dispatch(loginSuccess(response.data));
        
        // Điều hướng sau login dựa trên role (PB 02)
        const user = response.data.user;
        let redirectPath = '/dashboard';
        
        if (user) {
          if (user.role === 'ADMIN' || user.role === 'ROLE_ADMIN') {
            redirectPath = '/admin/dashboard';
          } else if (user.role === 'WORKER' || user.role === 'ROLE_WORKER' || user.role === 'employee') {
            redirectPath = '/tasks';
          } else if (user.role === 'OWNER' || user.role === 'ROLE_OWNER' || user.role === 'manager') {
            redirectPath = '/dashboard';
          }
        }

        const from = (location.state as any)?.from?.pathname || redirectPath;
        navigate(from, { replace: true });
      } else {
        setServerError('Email hoặc mật khẩu không đúng');
      }
    } catch (error: any) {
      setServerError(error.response?.data?.message || 'Có lỗi xảy ra khi đăng nhập');
    }
  });

  return {
    form,
    serverError,
    onSubmit,
  };
}
