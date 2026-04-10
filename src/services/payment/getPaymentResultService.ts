import { PaymentResult } from '@/types/payment/payment';
import { axiosInstance } from '../../config/axios';
import { type ApiResponse } from '../../types/payment/payment';

class GetPaymentResultService {
    async getPaymentResult(orderCode: string): Promise<ApiResponse<PaymentResult>> {
        const response = await axiosInstance.get(`/api/v1/payments/result/${orderCode}`);
        return response.data;
    }
}

export const getPaymentResultService = new GetPaymentResultService();
