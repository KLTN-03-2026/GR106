// CÁCH 3: Gọi API /me sau login

// services/authService.ts
export const authService = {
// ... các API khác

async getMe(): Promise<ApiResponse<UserInfo>> {
const response = await axiosInstance.get<ApiResponse<UserInfo>>('/api/v1/user/me');
return response.data;
}
};

// types/auth.ts
export interface UserInfo {
id: string;
email: string;
fullName: string;
role: string;
}

// hooks/login/useLogin.ts
const response = await authService.login(data);
if (response.success) {
const { accessToken, refreshToken } = response.data;

// Lưu tokens trước (để interceptor add vào header)
localStorage.setItem('accessToken', accessToken);
localStorage.setItem('refreshToken', refreshToken);

// Gọi API /me để lấy user info
const userResponse = await authService.getMe();
const user = userResponse.data;

// Lưu vào Redux
dispatch(setCredentials({
accessToken,
refreshToken,
user
}));

toast.success('Đăng nhập thành công');

// Redirect
switch (user.role) {
case 'owner': navigate('/dashboard/owner'); break;
case 'manager': navigate('/dashboard/manager'); break;
case 'employee': navigate('/dashboard/employee'); break;
default: navigate('/dashboard');
}
}
