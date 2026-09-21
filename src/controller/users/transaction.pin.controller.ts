import type { Response } from "express";

import { TransactionPinService } from "../../services/shared/transaction.pin.services.js";

import { sendSuccess } from "../../utils/response.utils.js";

import type { ClientAuthenticatedRequest } from "../../middleware/user.auth.middleware.js";

export class TransactionPinController {
    private transactionPinService: TransactionPinService;

    constructor() {
        this.transactionPinService =
            new TransactionPinService();
    }

    async setPin(
        req: ClientAuthenticatedRequest,
        res: Response
    ) {
        await this.transactionPinService.setPin(
            req.userId as number,
            req.body.pin
        );

        return sendSuccess(
            res,
            undefined,
            "Transaction PIN set successfully"
        );
    }

    async changePin(
        req: ClientAuthenticatedRequest,
        res: Response
    ) {
        await this.transactionPinService.changePin(
            req.userId as number,
            req.body.currentPin,
            req.body.newPin
        );

        return sendSuccess(
            res,
            undefined,
            "Transaction PIN changed successfully"
        );
    }
}
