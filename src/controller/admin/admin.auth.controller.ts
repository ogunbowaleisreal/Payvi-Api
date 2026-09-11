import type { Request, Response } from "express";
import { AdminAuthService } from "../../services/admin/admin.auth.service.js";
import {
    sendSuccess,
} from "../../utils/response.utils.js";
import type { AdminLoginInput } from "../../interfaces/admin/admin.auth.interface.js";

export class AdminAuthController {
    private adminAuthService: AdminAuthService;

    constructor() {
        this.adminAuthService = new AdminAuthService();
    }

    async login(req: Request, res: Response) {
        const input = req.body as AdminLoginInput;

        const result = await this.adminAuthService.login(input);

        return sendSuccess(
            res,
            result,
            "Admin login successful"
        );
    };

    async refresh(
        req: Request,
        res: Response
    ) {
        const { refreshToken } = req.body;

        const result =
            await this.adminAuthService
                .refreshAccessToken(refreshToken);

        return sendSuccess(
            res,
            result,
            "Access token refreshed successfully"
        );
    }

    async logout(req: Request, res: Response) {
        const { refreshToken } = req.body;

        await this.adminAuthService.logout(refreshToken);

        return sendSuccess(
            res,
            undefined,
            "Admin logged out successfully"
        );
    }

}