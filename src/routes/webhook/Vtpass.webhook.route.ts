import { Router } from "express";

import {
    VtpassWebhookController,
} from "../../controller/webhook/vtpass.webhook.controller.js";

const router = Router();

const webhookController =
    new VtpassWebhookController();

router.post(
    "/transaction-update",
    webhookController.handleTransactionUpdate.bind(
        webhookController
    )
);

export default router;