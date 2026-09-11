import { Router } from "express";

import { AdminRoleController } from "../../controller/admin.role.controller.js";

import {
    authenticateAdmin,
} from "../../middleware/admin.auth.middleware.js";

import {
    authorizeAdmin,
} from "../../middleware/admin.auth.middleware.js";

const router = Router();

const adminRoleController = new AdminRoleController();

router.post(
    "/roles",
    authenticateAdmin,
    authorizeAdmin(["manage_roles"]),
    adminRoleController.createRole.bind(adminRoleController)
);

router.get(
    "/roles",
    authenticateAdmin,
    authorizeAdmin(["manage_roles"]),
    adminRoleController.getAllRoles.bind(adminRoleController)
);

router.get(
    "/roles/:id",
    authenticateAdmin,
    authorizeAdmin(["manage_roles"]),
    adminRoleController.getRoleById.bind(adminRoleController)
);

router.get(
    "/permissions",
    authenticateAdmin,
    authorizeAdmin(["manage_permissions"]),
    adminRoleController.getAllPermissions.bind(
        adminRoleController
    )
);

export default router;