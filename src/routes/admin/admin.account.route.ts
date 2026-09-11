import { Router } from "express";

import {
    AdminController,
} from "../../controller/admin/admin.account.controller.js";

import {
    authenticateAdmin,
} from "../../middleware/admin.auth.middleware.js";

import {
    authorizeAdmin,
} from "../../middleware/admin.auth.middleware.js";

const router = Router();

const adminController =
    new AdminController();

router.post(
    "/admins",
    authenticateAdmin,
    authorizeAdmin(["create_admin"]),
    adminController.createAdmin.bind(
        adminController
    )
);

router.get(
    "/admins",
    authenticateAdmin,
    authorizeAdmin(["view_admin"]),
    adminController.getAllAdmins.bind(
        adminController
    )
);

router.get(
    "/admins/:id",
    authenticateAdmin,
    authorizeAdmin(["view_admin"]),
    adminController.getAdminById.bind(
        adminController
    )
);

router.patch(
    "/admins/:id",
    authenticateAdmin,
    authorizeAdmin(["update_admin"]),
    adminController.updateAdmin.bind(
        adminController
    )
);

router.patch(
    "/admins/:id/role",
    authenticateAdmin,
    authorizeAdmin(["update_admin"]),
    adminController.assignRole.bind(
        adminController
    )
);

router.patch(
    "/admins/:id/deactivate",
    authenticateAdmin,
    authorizeAdmin(["deactivate_admin"]),
    adminController.deactivateAdmin.bind(
        adminController
    )
);

export default router;