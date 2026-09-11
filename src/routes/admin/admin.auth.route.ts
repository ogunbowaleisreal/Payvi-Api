import { Router } from "express";

import {
    AdminAuthController,
} from "../../controller/admin/admin.auth.controller.js";

import {
    authenticateAdmin,
} from "../../middleware/admin.auth.middleware.js";

import {
    sendSuccess,
} from "../../utils/response.utils.js";

import type {
    AdminAuthenticatedRequest,
} from "../../middleware/admin.auth.middleware.js";

const router = Router();

const adminAuthController = new AdminAuthController();

router.post(
    "/auth/login",
    adminAuthController.login.bind(adminAuthController)
);

router.post(
    "/auth/refresh",
    adminAuthController.refresh.bind(adminAuthController)
);

router.post(
    "/auth/logout",
    adminAuthController.logout.bind(adminAuthController)
);

router.get(
    "/auth/me",
    authenticateAdmin,
    (req: AdminAuthenticatedRequest, res) => {
        return sendSuccess(
            res,
            {
                adminId: req.adminId,
            },
            "Authenticated admin"
        );
    }
);

export default router;
