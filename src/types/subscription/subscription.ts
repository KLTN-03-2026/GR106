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
