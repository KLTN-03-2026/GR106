import { useCallback, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CreateCropRequest, CreateCropTypeRequest } from '../../types/crop';
import { cropService } from '../../services/crop/cropService';

const CROP_KEYS = {
  all: ['crops'] as const,
  crops: ['crops', 'list'] as const,
  cropTypes: ['crops', 'types'] as const,
};

const withUnwrap = <T,>(promise: Promise<T>) =>
  Object.assign(promise, { unwrap: () => promise });

export const useCrops = () => {
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

  return {
    crops: cropsQuery.data ?? [],
    cropTypes: cropTypesQuery.data ?? [],
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
    clearError: useCallback(() => undefined, []),
  };
};
