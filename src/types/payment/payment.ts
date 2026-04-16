export type PaymentStatus = 'SUCCESS' | 'PENDING' | 'FAILED';

export interface PaymentResult {
    orderCode: string;
    status: PaymentStatus;
    amount?: number;
    plan?: string;
    reason?: string;
    time?: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

export type BillingCycle = 'MONTHLY' | 'YEARLY';

export interface CreatePaymentRequest {
    subscriptionPlanId: string;
    billingCycle: BillingCycle;
    farmId?: string;
}

export interface CreatePaymentResponse {
    checkoutUrl: string;
    orderCode: number;
    paymentStatus: string;
}
