import type {
    Response,
} from "express";

import { AccountService } from "../../services/user/user.account.service.js";
import { sendSuccess } from "../../utils/response.utils.js";
import type { ClientAuthenticatedRequest } from "../../middleware/user.auth.middleware.js";

export class AccountController {
    private accountService: AccountService;

    constructor() {
        this.accountService =
            new AccountService();
    }

    async updateTwoFactorStatus(
        req: ClientAuthenticatedRequest,
        res: Response
    ) {
        const { enabled } = req.body;

        await this.accountService.updateTwoFactorStatus(
            req.userId as number,
            enabled
        );

        return sendSuccess(
            res,
            undefined,
            enabled
                ? "Two-factor authentication enabled"
                : "Two-factor authentication disabled"
        );
    }

    async updateProfile(
        req: ClientAuthenticatedRequest,
        res: Response
    ) {
        const user =
            await this.accountService.updateProfile(
                req.userId as number,
                req.body
            );

        return sendSuccess(
            res,
            user,
            "Profile updated successfully"
        );
    }
}