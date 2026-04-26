import { useCallback, useEffect, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';
import { CreateCropRequest, CreateCropTypeRequest } from '../../types/crop';
import { cropService } from '../../services/crop/cropService';
import { AppDispatch, RootState } from '../../store';
import { clearCropState, setCropsSnapshot, setCropTypesSnapshot } from '../../store/cropSlice';

const CROP_KEYS = {
  all: ['crops'] as const,
  crops: ['crops', 'list'] as const,
  cropTypes: ['crops', 'types'] as const,
};

const withUnwrap = <T,>(promise: Promise<T>) =>
  Object.assign(promise, { unwrap: () => promise });

export const useCrops = () => {
  const dispatch = useDispatch<AppDispatch>();
  const cropBridge = useSelector((state: RootState) => state.crop);
  const queryClient = useQueryClient();

  const cropsQuery = useQuery({
    queryKey: CROP_KEYS.crops,
    queryFn: async () => {
      const response = await cropService.getCrops();
      return response.data ?? [];
    },
    enabled: false,
  });

  const cropTypesQuery = useQuery({
    queryKey: CROP_KEYS.cropTypes,
    queryFn: async () => {
      const response = await cropService.getCropTypes();
      return response.data ?? [];
    },
    enabled: false,
  });

  const createCropMutation = useMutation({
    mutationFn: async (data: CreateCropRequest) => {
      const response = await cropService.createCrop(data);
      return response.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CROP_KEYS.crops });
    },
  });

  const createCropTypeMutation = useMutation({
    mutationFn: async (data: CreateCropTypeRequest) => {
      const response = await cropService.createCropType(data);
      return response.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CROP_KEYS.cropTypes });
    },
  });

  const deleteCropTypeMutation = useMutation({
    mutationFn: async (id: string) => {
      await cropService.deleteCropType(id);
      return id;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CROP_KEYS.cropTypes });
    },
  });

  const loading = cropsQuery.isLoading || cropsQuery.isFetching || createCropMutation.isPending;
  const cropTypesLoading = cropTypesQuery.isLoading || cropTypesQuery.isFetching;
  const error = useMemo(
    () =>
      cropsQuery.error ??
      cropTypesQuery.error ??
      createCropMutation.error ??
      createCropTypeMutation.error ??
      deleteCropTypeMutation.error ??
      null,
    [
      cropsQuery.error,
      cropTypesQuery.error,
      createCropMutation.error,
      createCropTypeMutation.error,
      deleteCropTypeMutation.error,
    ],
  );

  useEffect(() => {
    if (cropsQuery.data) {
      dispatch(setCropsSnapshot(cropsQuery.data));
    }
  }, [dispatch, cropsQuery.data]);

  useEffect(() => {
    if (cropTypesQuery.data) {
      dispatch(setCropTypesSnapshot(cropTypesQuery.data));
    }
  }, [dispatch, cropTypesQuery.data]);

  return {
    crops: cropsQuery.data ?? cropBridge.cropsSnapshot,
    cropTypes: cropTypesQuery.data ?? cropBridge.cropTypesSnapshot,
    loading,
    cropTypesLoading,
    error,
    fetchCrops: useCallback(
      () => withUnwrap(queryClient.fetchQuery({ queryKey: CROP_KEYS.crops, queryFn: async () => (await cropService.getCrops()).data ?? [] })),
      [queryClient],
    ),
    fetchCropTypes: useCallback(
      () =>
        withUnwrap(
          queryClient.fetchQuery({
            queryKey: CROP_KEYS.cropTypes,
            queryFn: async () => (await cropService.getCropTypes()).data ?? [],
          }),
        ),
      [queryClient],
    ),
    createCrop: useCallback((data: CreateCropRequest) => withUnwrap(createCropMutation.mutateAsync(data)), [createCropMutation]),
    createCropType: useCallback(
      (data: CreateCropTypeRequest) => withUnwrap(createCropTypeMutation.mutateAsync(data)),
      [createCropTypeMutation],
    ),
    deleteCropType: useCallback((id: string) => withUnwrap(deleteCropTypeMutation.mutateAsync(id)), [deleteCropTypeMutation]),
    clearError: useCallback(() => {
      dispatch(clearCropState());
    }, [dispatch]),
  };
};
