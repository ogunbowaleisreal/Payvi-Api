import { Router } from "express";

import authRoutes from "../admin/admin.auth.route.js";

const router = Router();

router.use("/auth", authRoutes);

export default router;