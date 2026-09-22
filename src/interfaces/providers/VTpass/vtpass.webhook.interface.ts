export interface VtpassWebhookTransaction {
    status: string;
    transactionId?: string;
    unique_element?: string;
    amount?: number;
    total_amount?: number;
}

export interface VtpassWebhookData {
    code?: string;
    response_description?: string;

    requestId?: string;

    amount?: number;

    content?: {
        transactions?: VtpassWebhookTransaction;
    };
}

export interface VtpassTransactionUpdateWebhook {
    type: string;
    data: VtpassWebhookData;
}