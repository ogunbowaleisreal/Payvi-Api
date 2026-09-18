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
    authorizeAdmin(["MANAGEROLES"]),
    adminRoleController.createRole.bind(
        adminRoleController
    )
);

router.get(
    "/",
    authenticateAdmin,
    authorizeAdmin(["MANAGEROLES"]),
    adminRoleController.getAllRoles.bind(
        adminRoleController
    )
);

router.get(
    "/permissions",
    authenticateAdmin,
    authorizeAdmin(["MANAGEPERMS"]),
    adminRoleController.getAllPermissions.bind(
        adminRoleController
    )
);


router.get(
    "/:id",
    authenticateAdmin,
    authorizeAdmin(["MANAGEROLES"]),
    adminRoleController.getRoleById.bind(
        adminRoleController
    )
);



router.patch(
    "/:id",
    authenticateAdmin,
    authorizeAdmin(["MANAGEROLES"]),
    adminRoleController.updateRole.bind(
        adminRoleController
    )
);

router.put(
    "/:id/permissions",
    authenticateAdmin,
    authorizeAdmin(["MANAGEPERMS"]),
    adminRoleController.updateRolePermissions.bind(
        adminRoleController
    )
);

router.delete(
    "/:id",
    authenticateAdmin,
    authorizeAdmin(["MANAGEROLES"]),
    adminRoleController.deleteRole.bind(
        adminRoleController
    )
);

export default router;