import { useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { logout } from '../store/authSlice';
import { getUserFromToken } from '../utils/jwt';

export const useAuth = () => {
  const dispatch = useDispatch();
  const auth = useSelector((state: RootState) => state.auth);
  const user = useMemo(() => {
    if (!auth.accessToken) return null;
    
    // 1. Lấy thông tin cơ bản (Tên, Email) từ hubToken - Luôn chứa identity chính xác
    const identityUser = auth.hubToken ? getUserFromToken(auth.hubToken) : null;
    
    // 2. Lấy thông tin vai trò (Role) từ accessToken hiện tại - Phản ánh quyền hạn trong Farm
    const contextUser = getUserFromToken(auth.accessToken);
    
    return {
      ...identityUser, // Giữ id, email, fullName từ hubToken
      ...contextUser,  // Cập nhật role từ farmToken
      fullName: identityUser?.fullName || contextUser?.fullName // Ưu tiên tên từ hubToken
    };
  }, [auth.accessToken, auth.hubToken]);

  return useMemo(() => ({
    isAuthenticated: auth.isAuthenticated,
    accessToken: auth.accessToken,
    user,
    currentFarmId: auth.currentFarmId,
    logout: () => dispatch(logout())
  }), [auth.isAuthenticated, auth.accessToken, user, auth.currentFarmId, dispatch]);
};