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
    code: number;
    message: string;
    data: T;
    timestamp: string;
}

export type BillingCycle = 'MONTHLY' | 'ANNUAL';

export interface SePayIpnRequest {
    timestamp: number;
    notification_type: string;
    order: {
        id: string;
        order_id: string;
        order_status: string;
        order_currency: string;
        order_amount: number;
        order_invoice_number: string;
        order_description: string;
    };
    transaction: {
        id: string;
        transaction_id: string;
        transaction_type: string;
        transaction_date: string;
        transaction_status: string;
        transaction_amount: number;
        payment_method: string;
    };
}

export interface CreatePaymentRequest {
    subscriptionPlanId: string;
    billingCycle: BillingCycle;
    farmId?: string;
}

export interface SePayFormData {
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
    formData: SePayFormData;
}
