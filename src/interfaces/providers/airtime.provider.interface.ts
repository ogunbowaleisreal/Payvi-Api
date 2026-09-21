export interface AirtimePurchaseInput {
    phoneNumber: string;
    amount: number;
    reference: string;
}

export interface AirtimePurchaseResult {
    success: boolean;
    providerReference?: string;
    message?: string;
    rawResponse?: unknown;
}

export interface AirtimeProvider {
    purchaseAirtime(
        input: AirtimePurchaseInput
    ): Promise<AirtimePurchaseResult>;
}