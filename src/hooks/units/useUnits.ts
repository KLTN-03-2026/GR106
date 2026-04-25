import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { 
  fetchUnits, 
} from '../../store/unitSlice';
import { useCallback } from 'react';

export const useUnits = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { units, loading, error } = useSelector(
    (state: RootState) => state.unit
  );

  return {
    // State
    units,
    loading,
    error,

    // Actions
    fetchUnits: useCallback(() => dispatch(fetchUnits()), [dispatch]),
  };
};
