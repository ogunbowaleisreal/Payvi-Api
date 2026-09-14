import { Router } from "express";

import authRoutes from "../admin/admin.auth.route.js";
import rolesRoute from "../admin/admin.roles.route.js";
import adminAccountRoutes from "../admin/admin.account.route.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/account", adminAccountRoutes);
router.use("/roles", rolesRoute);

export default router;