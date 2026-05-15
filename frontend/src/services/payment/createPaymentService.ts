import { CreatePaymentRequest, CreatePaymentResponse } from '@/types/payment/payment';
import { axiosInstance } from '../../config/axios';
import {
    type ApiResponse,
} from '../../types/payment/payment';

class CreatePaymentService {
    async createPayment(
        data: CreatePaymentRequest
    ): Promise<ApiResponse<CreatePaymentResponse>> {
        const response = await axiosInstance.post('/api/v1/payment/create', data);
        return response.data;
    }

    // IPN Callback from SePay (Mainly for reference/documentation sync)
    async handleIPN(data: any): Promise<any> {
        const response = await axiosInstance.post('/api/v1/payment/ipn', data);
        return response.data;
    }
}

export const createPaymentService = new CreatePaymentService();
