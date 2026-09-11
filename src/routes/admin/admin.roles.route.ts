import { Router } from "express";

import { AdminRoleController } from "../../controller/admin/admin.role.controller.js";

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

router.patch(
    "/roles/:id",
    authenticateAdmin,
    authorizeAdmin(["manage_roles"]),
    adminRoleController.updateRole.bind(
        adminRoleController
    )
);

router.put(
    "/roles/:id/permissions",
    authenticateAdmin,
    authorizeAdmin(["manage_permissions"]),
    adminRoleController.updateRolePermissions.bind(
        adminRoleController
    )
);

router.delete(
    "/roles/:id",
    authenticateAdmin,
    authorizeAdmin(["manage_roles"]),
    adminRoleController.deleteRole.bind(
        adminRoleController
    )
);

export default router;