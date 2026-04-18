import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { logout } from '../store/authSlice';
import { getUserFromToken } from '../utils/jwt';

export const useAuth = () => {
  const dispatch = useDispatch();
  const auth = useSelector((state: RootState) => state.auth);
  const user = auth.accessToken ? getUserFromToken(auth.accessToken) : null;

  return {
    isAuthenticated: auth.isAuthenticated,
    accessToken: auth.accessToken,
    user,
    currentFarmId: auth.currentFarmId,
    logout: () => dispatch(logout())
  };
};