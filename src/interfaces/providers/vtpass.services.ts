import axios, {
    type AxiosInstance,
    type AxiosRequestConfig,
} from "axios";
import { randomBytes } from "node:crypto";

import { vtpassConfig } from "../../config/vtpass.js";


/*
|--------------------------------------------------------------------------
| Provider Types
|--------------------------------------------------------------------------
*/

export type VtpassTransactionStatus =
    | "initiated"
    | "pending"
    | "processing"
    | "delivered"
    | "failed"
    | "reversed"
    | string;

interface VtpassTransaction {
    status: VtpassTransactionStatus;
    product_name?: string;
    unique_element?: string;
    unit_price?: number;
    quantity?: number;
    commission?: number;
    total_amount?: number;
    amount?: number;
    transactionId: string;
    product_id?: number;
    [key: string]: unknown;
}

interface VtpassResponse {
    code: string;
    response_description: string;

    content?: {
        transactions?: VtpassTransaction;
    };

    requestId?: string;
    amount?: number;
    transaction_date?: string;
    purchased_code?: string;

    [key: string]: unknown;
}


/*
|--------------------------------------------------------------------------
| Normalized Response
|--------------------------------------------------------------------------
*/

export interface VtpassResult {
    success: boolean;
    status: VtpassTransactionStatus;
    code: string;
    message?: string;
    requestId: string;
    providerReference?: string;
    amount?: number;
    rawResponse: VtpassResponse;
}


/*
|--------------------------------------------------------------------------
| Purchase Inputs
|--------------------------------------------------------------------------
*/

interface AirtimePurchaseInput {
    serviceId: string;
    phoneNumber: string;
    amount: number;
    requestId?: string;
}

interface DataPurchaseInput {
    serviceId: string;
    phoneNumber: string;
    variationCode: string;
    amount?: number;
    requestId?: string;
}


/*
|--------------------------------------------------------------------------
| VTpass Service
|--------------------------------------------------------------------------
*/

export class VtpassService {
    private readonly client: AxiosInstance;

    constructor() {
        this.client = axios.create({
            baseURL: vtpassConfig.baseUrl,
            timeout: 30_000,
            headers: {
                "Content-Type": "application/json",
            },
        });

        this.client.interceptors.request.use(
            (config) => {
                config.headers.set(
                    "api-key",
                    vtpassConfig.apiKey
                );

                config.headers.set(
                    "secret-key",
                    vtpassConfig.secretKey
                );

                return config;
            }
        );
    }


    /*
    |--------------------------------------------------------------------------
    | Request ID
    |--------------------------------------------------------------------------
    */

    private generateRequestId(): string {
        const now = new Date();

        const lagosTime = new Date(
            now.toLocaleString("en-US", {
                timeZone: "Africa/Lagos",
            })
        );

        const year = lagosTime.getFullYear();
        const month = String(
            lagosTime.getMonth() + 1
        ).padStart(2, "0");

        const day = String(
            lagosTime.getDate()
        ).padStart(2, "0");

        const hours = String(
            lagosTime.getHours()
        ).padStart(2, "0");

        const minutes = String(
            lagosTime.getMinutes()
        ).padStart(2, "0");

        const timestamp =
            `${year}${month}${day}${hours}${minutes}`;

        const uniquePart =
            randomBytes(8).toString("hex");

        return `${timestamp}${uniquePart}`;
    }


    /*
    |--------------------------------------------------------------------------
    | Airtime
    |--------------------------------------------------------------------------
    */

    async purchaseAirtime(
        input: AirtimePurchaseInput
    ): Promise<VtpassResult> {
        const requestId =
            input.requestId ??
            this.generateRequestId();

        const payload = {
            request_id: requestId,
            serviceID: input.serviceId,
            amount: input.amount,
            phone: input.phoneNumber,
        };

        const response =
            await this.post<VtpassResponse>(
                "/pay",
                payload
            );

        return this.normalizeResponse(
            response,
            requestId
        );
    }


    /*
    |--------------------------------------------------------------------------
    | Data
    |--------------------------------------------------------------------------
    */

    async purchaseData(
        input: DataPurchaseInput
    ): Promise<VtpassResult> {
        const requestId =
            input.requestId ??
            this.generateRequestId();

        const payload = {
            request_id: requestId,
            serviceID: input.serviceId,
            billersCode: input.phoneNumber,
            variation_code: input.variationCode,
            ...(input.amount !== undefined && {
                amount: input.amount,
            }),
            phone: input.phoneNumber,
        };

        const response =
            await this.post<VtpassResponse>(
                "/pay",
                payload
            );

        return this.normalizeResponse(
            response,
            requestId
        );
    }


    /*
    |--------------------------------------------------------------------------
    | Requery
    |--------------------------------------------------------------------------
    */

    async requeryTransaction(
        requestId: string
    ): Promise<VtpassResult> {
        const response =
            await this.post<VtpassResponse>(
                "/requery",
                {
                    request_id: requestId,
                }
            );

        return this.normalizeResponse(
            response,
            requestId
        );
    }


    /*
    |--------------------------------------------------------------------------
    | HTTP
    |--------------------------------------------------------------------------
    */

    private async post<T>(
        url: string,
        data: unknown,
        config?: AxiosRequestConfig
    ): Promise<T> {
        const response =
            await this.client.post<T>(
                url,
                data,
                config
            );

        return response.data;
    }


    /*
    |--------------------------------------------------------------------------
    | Response Normalization
    |--------------------------------------------------------------------------
    */

    private normalizeResponse(
        response: VtpassResponse,
        requestId: string
    ): VtpassResult {
        const transaction =
            response.content?.transactions;

        const status =
            transaction?.status ??
            "unknown";

        return {
            success:
                status === "delivered",

            status,

            code:
                response.code,

            message:
                response.response_description,

            requestId:
                response.requestId ??
                requestId,

            providerReference:
                transaction?.transactionId as string,

            amount:
                transaction?.amount as number ??
                response.amount,

            rawResponse:
                response,
        };
    }
}