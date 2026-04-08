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
        const user = getUserFromToken(accessToken);
        
        if (!user) {
          setServerError('Token không hợp lệ');
          return;
        }

        // Lưu thông tin tạm thời để lấy farm
        localStorage.setItem('accessToken', accessToken);

        const targetPath = '/dashboard';

        dispatch(setCredentials({
          accessToken,
          refreshToken,
          user
        }));
        
        toast.success('Đăng nhập thành công');
        navigate(targetPath);
      } else {
        const message = response.message || 'Đăng nhập thất bại';
        setServerError(message);
      }
    } catch (error) {
      // Lấy message từ Backend và hiển thị trong Form
      const apiError = error as { response?: { data?: { message?: string } } };
      const message = apiError.response?.data?.message || 'Đã xảy ra lỗi. Vui lòng thử lại';
      
      setServerError(message);
    }
  });

  return {
    form,
    serverError,
    onSubmit,
  };
}
