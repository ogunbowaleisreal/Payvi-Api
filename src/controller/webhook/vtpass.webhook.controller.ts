import type { Request, Response } from "express";

import {
    VtpassWebhookService,
} from "../../providers/VTpass/VTpass.webhook.service.js";

import type {
    VtpassTransactionUpdateWebhook,
} from "../../interfaces/providers/VTpass/vtpass.webhook.interface.js";

export class VtpassWebhookController {
    private readonly webhookService: VtpassWebhookService;

    constructor() {
        this.webhookService =
            new VtpassWebhookService();
    }

    async handleTransactionUpdate(
        req: Request,
        res: Response
    ) {
        const webhook =
            req.body as VtpassTransactionUpdateWebhook;

        /*
         * Acknowledge VTpass immediately.
         */
        res.status(200).json({
            response: "success",
        });

        /*
         * Process the webhook after acknowledgement.
         */
        try {
            await this.webhookService
                .handleTransactionUpdate(webhook);
        } catch (error) {
            console.error(
                "VTpass webhook processing failed:",
                error
            );
        }
    }
}