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

export type BillingCycle = 'MONTHLY' | 'ANNUAL';

export interface CreatePaymentRequest {
    subscriptionPlanId: string;
    billingCycle: BillingCycle;
    farmId?: string;
}

export interface SepayFormData {
    actionUrl: string;
    orderAmount: string;
    merchant: string;
    currency: string;
    operation: string;
    orderDescription: string;
    orderInvoiceNumber: string;
    successUrl: string;
    errorUrl: string;
    cancelUrl: string;
    signature: string;
}

export interface CreatePaymentResponse {
    transactionId: string;
    orderCode: string;
    amount: string;
    currency: string;
    status: string;
    expiredAt: string;
    formData: SepayFormData;
}
