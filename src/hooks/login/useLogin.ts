import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'sonner';
import { authService } from '../../services/authService';
import { setCredentials } from '../../store/authSlice';
import { getUserFromToken } from '../../utils/jwt';

const loginSchema = z.object({
  email: z.string().min(1, 'Email là bắt buộc').email('Định dạng email không hợp lệ'),
  password: z.string().min(1, 'Mật khẩu là bắt buộc'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function useLogin() {
  const [serverError, setServerError] = useState<string | null>(null);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = form.handleSubmit(async (data: LoginFormValues) => {
    setServerError(null);
    
    try {
      const response = await authService.login(data);
      if (response.success) {
        const { accessToken, refreshToken } = response.data;
        
        // Decode JWT token để lấy user info
        const user = getUserFromToken(accessToken);
        
        if (!user) {
          setServerError('Token không hợp lệ');
          toast.error('Token không hợp lệ');
          return;
        }
        
        // Lưu vào Redux với user info từ token
        dispatch(setCredentials({
          accessToken,
          refreshToken,
          user
        }));
        
        toast.success('Đăng nhập thành công');
        
        // Redirect dựa vào role
        switch (user.role) {
          case 'owner':
            navigate('/dashboard/owner');
            break;
          case 'manager':
            navigate('/dashboard/manager');
            break;
          case 'employee':
            navigate('/dashboard/employee');
            break;
          default:
            navigate('/dashboard');
        }
      } else {
        // Hiển thị message từ server
        const message = response.message || 'Đăng nhập thất bại';
        setServerError(message);
        toast.error(message);
      }
    } catch (error) {
      // Lấy message từ Backend
      const apiError = error as { response?: { data?: { message?: string } } };
      const message = apiError.response?.data?.message || 'Đã xảy ra lỗi. Vui lòng thử lại';
      
      setServerError(message);
      toast.error(message);
    }
  });

  return {
    form,
    serverError,
    onSubmit,
  };
}
