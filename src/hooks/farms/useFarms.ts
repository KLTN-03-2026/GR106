import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { 
  fetchFarms, 
  fetchFarmsSummary, 
  createFarm, 
  updateFarm, 
  deleteFarm,
  clearFarmData 
} from '../../store/farmSlice';
import { CreateFarmInput } from '../../types/farm';
import { useCallback } from 'react';

export const useFarms = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { farms, farmSummary, currentFarm, loading, error } = useSelector(
    (state: RootState) => state.farm
  );

  return {
    // State
    farms,
    farmSummary,
    currentFarm,
    loading,
    error,

    // Actions
    fetchFarms: useCallback(() => dispatch(fetchFarms()), [dispatch]),
    fetchFarmsSummary: useCallback(() => dispatch(fetchFarmsSummary()), [dispatch]),
    createFarm: useCallback((data: CreateFarmInput) => dispatch(createFarm(data)), [dispatch]),
    updateFarm: useCallback((farmId: string, data: { name: string; description: string }) => 
      dispatch(updateFarm({ farmId, data })), [dispatch]),
    deleteFarm: useCallback((id: string) => dispatch(deleteFarm(id)), [dispatch]),
    clearData: useCallback(() => dispatch(clearFarmData()), [dispatch]),
  };
};
