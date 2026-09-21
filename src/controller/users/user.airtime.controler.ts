import type { Response } from "express";

import {
    AirtimeService,
} from "../../services/user/user.airtime.services.js";

import {
    sendSuccess,
} from "../../utils/response.utils.js";

import type {
    ClientAuthenticatedRequest,
} from "../../middleware/user.auth.middleware.js";


export class AirtimeController {

    private airtimeService: AirtimeService;


    constructor() {
        this.airtimeService =
            new AirtimeService();
    }


    async purchaseAirtime(
        req: ClientAuthenticatedRequest,
        res: Response
    ) {

        const result =
            await this.airtimeService.purchaseAirtime(

                req.userId as number,

                {
                    phoneNumber:
                        req.body.phoneNumber,

                    network:
                        req.body.network,

                    amount:
                        req.body.amount,

                    transactionPin:
                        req.body.transactionPin,
                }
            );


        return sendSuccess(
            res,
            result,
            "Airtime purchase processed successfully"
        );
    }
}