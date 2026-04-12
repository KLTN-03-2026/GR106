import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { getSubscriptionPlansService } from '@/services/subscription/getSubscriptionPlanService';
import { FarmSubscription } from '@/types/subscription/subscription';

/**
 * Hook để lấy lịch sử đăng ký gói của trang trại hiện tại
 */
export const useSubscriptionHistory = () => {
  const { currentFarmId, subscriptionVersion } = useSelector((state: RootState) => state.auth);
  const [data, setData] = useState<FarmSubscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const res = await getSubscriptionPlansService.getHistory();
      if (res.success) {
        setData(res.data);
        setError(null);
      } else {
        setError(res.message || 'Không thể tải lịch sử đăng ký');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Lỗi kết nối máy chủ');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentFarmId) {
      fetchHistory();
    } else {
      setData([]);
      setIsLoading(false);
    }
  }, [currentFarmId, subscriptionVersion]);

  return { data, isLoading, error, refresh: fetchHistory };
};

/**
 * Hook để lấy gói đăng ký hiện tại đang hoạt động của trang trại
 */
export const useCurrentSubscription = () => {
  const { currentFarmId, subscriptionVersion } = useSelector((state: RootState) => state.auth);
  const [data, setData] = useState<FarmSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCurrent = async () => {
    setIsLoading(true);
    try {
      const res = await getSubscriptionPlansService.getCurrent();
      if (res.success) {
        setData(res.data);
        setError(null);
      } else {
        setError(res.message || 'Không thể tải thông tin gói hiện tại');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Lỗi kết nối máy chủ');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentFarmId) {
      fetchCurrent();
    } else {
      setData(null);
      setIsLoading(false);
    }
  }, [currentFarmId, subscriptionVersion]);

  return { data, isLoading, error, refresh: fetchCurrent };
};
