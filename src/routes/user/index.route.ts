import { Router } from "express";

import authRoutes from "./user.auth.route.js";
import accountRoutes from "./account.route.js"

const router = Router();

router.use("/auth", authRoutes);
router.use("/account", accountRoutes);

export default router;