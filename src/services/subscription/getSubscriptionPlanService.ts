import { axiosInstance } from '@/config/axios';
import { ApiResponse } from '@/types/payment/payment';
import { SubscriptionPlan } from '@/types/subscription/subscription';

class GetSubscriptionPlansService {
    async getPlans(): Promise<ApiResponse<SubscriptionPlan[]>> {
        const response = await axiosInstance.get('/api/v1/subscriptions');
        return response.data;
    }
}

export const getSubscriptionPlansService = new GetSubscriptionPlansService();
