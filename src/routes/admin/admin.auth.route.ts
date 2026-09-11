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

const adminAuthController =
    new AdminAuthController();

router.post(
    "/login",
    adminAuthController.login.bind(
        adminAuthController
    )
);

router.post(
    "/refresh",
    adminAuthController.refresh.bind(
        adminAuthController
    )
);

router.post(
    "/logout",
    adminAuthController.logout.bind(
        adminAuthController
    )
);

router.get(
    "/me",
    authenticateAdmin,
    (
        req: AdminAuthenticatedRequest,
        res
    ) => {
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

