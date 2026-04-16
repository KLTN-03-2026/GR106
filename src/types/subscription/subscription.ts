export interface SubscriptionPlan {
    id: string;
    name: string;
    priceMonthly: number;
    priceAnnual: number;
    maxPlots: number;
    maxMembers: number;
    hasAiDiagnosis: boolean;
    hasPdfExport: boolean;
    hasMap: boolean;
    description: string;
}

export type SubscriptionStatus = 'TRIAL' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'GRACE_PERIOD';
export type BillingCycle = 'MONTHLY' | 'YEARLY';

export interface FarmSubscription {
    id: string;
    farmId: string;
    subscriptionPlanId: string;
    subscriptionPlanName: string;
    status: SubscriptionStatus;
    billingCycle: BillingCycle;
    isCurrent: boolean;
    startedAt: string;
    expiresAt: string;
    graceUntil?: string;
    autoRenew: boolean;
}
