import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { logout } from '../store/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const auth = useSelector((state: RootState) => state.auth);

  return {
    isAuthenticated: auth.isAuthenticated,
    accessToken: auth.accessToken,
    logout: () => dispatch(logout())
  };
};