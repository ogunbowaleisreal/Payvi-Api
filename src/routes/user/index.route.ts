import { Router } from "express";

import authRoutes from "./user.auth.route.js";
import accountRoutes from "./account.route.js"
import airtimeRoutes from "./user.airtime.js"
import transactionPinRoutes from "./transaction.pin.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/account", accountRoutes);
router.use("/airtime", airtimeRoutes);
router.use("/transaction-pin", transactionPinRoutes);


export default router;