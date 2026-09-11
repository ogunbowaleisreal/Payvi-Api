import { Router } from "express";

import { AccountController } from "../../controller/users/user.account.controller.js";
import { ClientAuthMiddleware } from "../../middleware/user.auth.middleware.js";

const router = Router();

const accountController =
    new AccountController();

router.patch(
    "/2fa",
    ClientAuthMiddleware,
    accountController.updateTwoFactorStatus.bind(
        accountController
    )
);

router.patch(
    "/profile",
    ClientAuthMiddleware,
    accountController.updateProfile.bind(
        accountController
    )
);

export default router;