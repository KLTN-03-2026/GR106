import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { 
  fetchCrops, 
  fetchCropTypes, 
  createCrop, 
  createCropType, 
  deleteCropType,
  clearCropError 
} from '../../store/cropSlice';
import { CreateCropRequest, CreateCropTypeRequest } from '../../types/crop';
import { useCallback } from 'react';

export const useCrops = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { crops, cropTypes, loading, cropTypesLoading, error } = useSelector(
    (state: RootState) => state.crop
  );

  return {
    // State
    crops,
    cropTypes,
    loading,
    cropTypesLoading,
    error,

    // Actions
    fetchCrops: useCallback(() => dispatch(fetchCrops()), [dispatch]),
    fetchCropTypes: useCallback(() => dispatch(fetchCropTypes()), [dispatch]),
    createCrop: useCallback((data: CreateCropRequest) => dispatch(createCrop(data)), [dispatch]),
    createCropType: useCallback((data: CreateCropTypeRequest) => dispatch(createCropType(data)), [dispatch]),
    deleteCropType: useCallback((id: string) => dispatch(deleteCropType(id)), [dispatch]),
    clearError: useCallback(() => dispatch(clearCropError()), [dispatch]),
  };
};
