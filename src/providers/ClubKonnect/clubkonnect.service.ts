import axios, {
    type AxiosInstance,
} from "axios";

import {
    clubkonnectConfig,
} from "../../config/clubkonnect.js";


export type ClubkonnectStatus =
    | "delivered"
    | "failed"
    | "processing"
    | "unknown";


interface ClubkonnectRawResponse {
    orderid?: string;
    orderId?: string;

    requestid?: string;
    requestId?: string;

    statuscode?: string | number;
    statusCode?: string | number;

    status?: string;
    orderstatus?: string;
    orderStatus?: string;

    remark?: string;
    orderremark?: string;
    description?: string;

    [key: string]: unknown;
}


export interface ClubkonnectResult {
    success: boolean;

    status: ClubkonnectStatus;

    code?: number;

    message?: string;

    requestId: string;

    providerReference?: string;

    rawResponse: ClubkonnectRawResponse;
}


interface AirtimePurchaseInput {
    network: string;

    phoneNumber: string;

    amount: number;

    requestId: string;
}


interface DataPurchaseInput {
    network: string;

    phoneNumber: string;

    dataPlan: string;

    requestId: string;
}


export class ClubkonnectService {
    private readonly client: AxiosInstance;

    constructor() {
        this.client = axios.create({
            baseURL: clubkonnectConfig.baseUrl,

            timeout: 30_000,

            headers: {
                Accept: "application/json",
            },
        });
    }
    private getNetworkCode(
        network: string
    ): string {

        switch (network.toUpperCase()) {
            case "MTN":
                return "01";

            case "GLO":
                return "02";

            case "T2MOBILE":
            case "NINEMOBILE":
                return "03";

            case "AIRTEL":
                return "04";

            default:
                throw new Error(
                    `Unsupported network: ${network}`
                );
        }
    }


    /*
    |--------------------------------------------------------------------------
    | Airtime Purchase
    |--------------------------------------------------------------------------
    */

    async purchaseAirtime(
        input: AirtimePurchaseInput
    ): Promise<ClubkonnectResult> {

        const response =
            await this.client.get<ClubkonnectRawResponse>(
                "/APIAirtimeV1.asp",
                {
                    params: {
                        UserID:
                            clubkonnectConfig.userId,

                        APIKey:
                            clubkonnectConfig.apiKey,

                        MobileNetwork:
                            this.getNetworkCode(
                                input.network
                            ),

                        Amount:
                            input.amount,

                        MobileNumber:
                            input.phoneNumber,

                        RequestID:
                            input.requestId,

                        ...(clubkonnectConfig.callbackUrl && {
                            CallBackURL:
                                clubkonnectConfig.callbackUrl,
                        }),
                    },
                }
            );

        return this.normalizeResponse(
            response.data,
            input.requestId
        );
    }


    /*
    |--------------------------------------------------------------------------
    | Data Purchase
    |--------------------------------------------------------------------------
    */

    async purchaseData(
        input: DataPurchaseInput
    ): Promise<ClubkonnectResult> {

        const response =
            await this.client.get<ClubkonnectRawResponse>(
                "/APIDatabundleV1.asp",
                {
                    params: {
                        UserID:
                            clubkonnectConfig.userId,

                        APIKey:
                            clubkonnectConfig.apiKey,

                        MobileNetwork:
                            this.getNetworkCode(
                                input.network
                            ),

                        DataPlan:
                            input.dataPlan,

                        MobileNumber:
                            input.phoneNumber,

                        RequestID:
                            input.requestId,

                        ...(clubkonnectConfig.callbackUrl && {
                            CallBackURL:
                                clubkonnectConfig.callbackUrl,
                        }),
                    },
                }
            );

        return this.normalizeResponse(
            response.data,
            input.requestId
        );
    }


    /*
    |--------------------------------------------------------------------------
    | Transaction Requery
    |--------------------------------------------------------------------------
    */

    async requeryTransaction(
        requestId: string
    ): Promise<ClubkonnectResult> {

        const response =
            await this.client.get<ClubkonnectRawResponse>(
                "/APIQueryV1.asp",
                {
                    params: {
                        UserID:
                            clubkonnectConfig.userId,

                        APIKey:
                            clubkonnectConfig.apiKey,

                        RequestID:
                            requestId,
                    },
                }
            );

        return this.normalizeResponse(
            response.data,
            requestId
        );
    }


    /*
    |--------------------------------------------------------------------------
    | Response Normalization
    |--------------------------------------------------------------------------
    */

    private normalizeResponse(
        response: ClubkonnectRawResponse,
        requestId: string
    ): ClubkonnectResult {

        const rawCode =
            response.statuscode ??
            response.statusCode;

        const code =
            rawCode !== undefined
                ? Number(rawCode)
                : undefined;

        const rawStatus = (
            response.orderstatus ??
            response.orderStatus ??
            response.status ??
            ""
        ).toUpperCase();

        let status: ClubkonnectStatus = "unknown";


        /*
         * A status code of 200 means completed
         * successfully according to the API docs.
         */

        if (
            code === 200 &&
            rawStatus === "ORDER_COMPLETED"
        ) {
            status = "delivered";
        }


        /*
         * Explicitly cancelled transactions are
         * failures. Other states must be reconciled.
         */

        else if (
            rawStatus === "ORDER_CANCELLED" ||
            rawStatus === "ORDER_REFUNDED" ||
            (code !== undefined &&
                code >= 500 &&
                code <= 599)
        ) {
            status = "failed";
        }


        /*
         * Orders awaiting processing, network responses,
         * or retry resolution remain processing.
         */

        else if (
            rawStatus === "ORDER_RECEIVED" ||
            rawStatus === "ORDER_PROCESSING" ||
            rawStatus === "ORDER_ONHOLD" ||
            rawStatus === "ORDER_PROCESSED" ||
            code === 100 ||
            code === 201 ||
            code === 300 ||
            code === 600 ||
            code === 601 ||
            code === 602 ||
            code === 603 ||
            code === 604 ||
            code === 605 ||
            code === 606 ||
            code === 699 ||
            code === 799 ||
            code === 899
        ) {
            status = "processing";
        }

        return {
            success: status === "delivered",
            status,

            ...(code !== undefined && {
                code,
            }),

            message:
                response.orderremark ??
                response.remark ??
                response.description ??
                rawStatus ??
                "No provider message",

            requestId:
                response.requestid ??
                response.requestId ??
                requestId,

            ...(
                (response.orderid ?? response.orderId) !== undefined && {
                    providerReference:
                        response.orderid ?? response.orderId,
                }
            ),

            rawResponse: response,
        };
    }
}