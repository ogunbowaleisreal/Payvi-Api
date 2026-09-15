import { Router } from "express";

import {
    AdminController,
} from "../../controller/admin/admin.account.controller.js";

import {
    authenticateAdmin,
    authorizeAdmin,
} from "../../middleware/admin.auth.middleware.js";

const router = Router();

const adminController = new AdminController();

router.post(
    "/admins",
    authenticateAdmin,
    authorizeAdmin(["CRTADMIN"]),
    adminController.createAdmin.bind(
        adminController
    )
);

router.get(
    "/admins",
    authenticateAdmin,
    authorizeAdmin(["VIEWADMIN"]),
    adminController.getAllAdmins.bind(
        adminController
    )
);

router.get(
    "/admins/:id",
    authenticateAdmin,
    authorizeAdmin(["VIEWADMIN"]),
    adminController.getAdminById.bind(
        adminController
    )
);

router.patch(
    "/admins/:id",
    authenticateAdmin,
    authorizeAdmin(["UPDTADMIN"]),
    adminController.updateAdmin.bind(
        adminController
    )
);

router.patch(
    "/admins/:id/role",
    authenticateAdmin,
    authorizeAdmin(["UPDTADMIN"]),
    adminController.assignRole.bind(
        adminController
    )
);

router.patch(
    "/admins/:id/deactivate",
    authenticateAdmin,
    authorizeAdmin(["DEACTADMIN"]),
    adminController.deactivateAdmin.bind(
        adminController
    )
);

export default router;