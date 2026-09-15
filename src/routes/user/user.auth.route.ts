import { Router } from "express";

import { UserController } from "../../controller/users/user.controller.js";
import { rateLimit } from "../../middleware/rate.limiter.middeware.js";
import { authRateLimit } from "../../config/rate.limit.js";

const router = Router();

const userController = new UserController();
router.use(rateLimit(authRateLimit));

router.post(
    "/register",
    userController.register.bind(userController)
);

router.post(
    "/login",
    userController.login.bind(userController)
);

router.post(
    "/refresh",
    userController.refreshAccessToken.bind(userController)
);

router.post(
    "/verify-email",
    userController.verifyEmail.bind(userController)
);
router.post(
    "/resend-verification",
    userController.resendVerificationOtp.bind(
        userController
    )
);

router.post(
    "/forgot-password",
    userController.forgotPassword.bind(userController)
);

router.post(
    "/verify-reset-otp",
    userController.verifyResetOtp.bind(userController)
);

router.post(
    "/reset-password",
    userController.resetPassword.bind(userController)
);

router.post(
    "/verify-2fa",
    userController.verifyTwoFactor.bind(
        userController
    )
);

export default router;