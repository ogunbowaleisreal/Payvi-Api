import { Router } from "express";
import vtPassWebhookRoute from "./Vtpass.webhook.route.js";
import reloadlyWebhookRoute from "./reloadly.webhook.routes.js"

const router = Router();

router.use("/vtpass", vtPassWebhookRoute);
router.use("/reloadly", reloadlyWebhookRoute);


export default router;