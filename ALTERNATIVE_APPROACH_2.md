// CÁCH 2: Nếu Backend trả user info trong response

// types/auth.ts
export interface AuthTokens {
accessToken: string;
refreshToken: string;
user?: { // ← Thêm optional user
id: string;
email: string;
fullName: string;
role: string;
};
}

// hooks/login/useLogin.ts
const response = await authService.login(data);
if (response.success) {
const { accessToken, refreshToken, user } = response.data;

// Không cần decode JWT nữa, dùng user từ response
if (!user) {
setServerError('Không nhận được thông tin user');
return;
}

dispatch(setCredentials({
accessToken,
refreshToken,
user // ← Dùng trực tiếp từ response
}));

// Redirect dựa vào role
switch (user.role) {
case 'owner': navigate('/dashboard/owner'); break;
case 'manager': navigate('/dashboard/manager'); break;
case 'employee': navigate('/dashboard/employee'); break;
default: navigate('/dashboard');
}
}
