import { Router } from "express";

import {
    AdminRoleController,
} from "../../controller/admin/admin.role.controller.js";

import {
    authenticateAdmin,
    authorizeAdmin,
} from "../../middleware/admin.auth.middleware.js";

const router = Router();

const adminRoleController =
    new AdminRoleController();

router.post(
    "/",
    authenticateAdmin,
    authorizeAdmin(["manage_roles"]),
    adminRoleController.createRole.bind(
        adminRoleController
    )
);

router.get(
    "/",
    authenticateAdmin,
    authorizeAdmin(["manage_roles"]),
    adminRoleController.getAllRoles.bind(
        adminRoleController
    )
);

router.get(
    "/:id",
    authenticateAdmin,
    authorizeAdmin(["manage_roles"]),
    adminRoleController.getRoleById.bind(
        adminRoleController
    )
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
    "/:id",
    authenticateAdmin,
    authorizeAdmin(["manage_roles"]),
    adminRoleController.updateRole.bind(
        adminRoleController
    )
);

router.put(
    "/:id/permissions",
    authenticateAdmin,
    authorizeAdmin(["manage_permissions"]),
    adminRoleController.updateRolePermissions.bind(
        adminRoleController
    )
);

router.delete(
    "/:id",
    authenticateAdmin,
    authorizeAdmin(["manage_roles"]),
    adminRoleController.deleteRole.bind(
        adminRoleController
    )
);

export default router;
