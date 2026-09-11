import type { Request, Response } from "express";

import { UserService } from "../../services/user/user.service.js";

import {
    sendSuccess,
    sendCreated,
} from "../../utils/response.utils.js";

export class UserController {
    private userService: UserService;

    constructor() {
        this.userService = new UserService();
    }

    async register(req: Request, res: Response) {
        const user = await this.userService.registerUser(req.body);

        return sendCreated(
            res,
            user,
            "User registered successfully"
        );
    }

    async verifyEmail(req: Request, res: Response) {
        const { email, otp } = req.body;

        await this.userService.verifyEmail(
            email,
            otp
        );

        return sendSuccess(
            res,
            undefined,
            "Email verified successfully"
        );
    }

    async resendVerificationOtp(
        req: Request,
        res: Response
    ) {
        const { email } = req.body;

        await this.userService.resendVerificationOtp(
            email
        );

        return sendSuccess(
            res,
            undefined,
            "Verification code sent successfully"
        );
    }

    async login(req: Request, res: Response) {
        const result = await this.userService.login(req.body);

        return sendSuccess(
            res,
            result,
            "Login successful"
        );
    }
    async verifyTwoFactor(
        req: Request,
        res: Response
    ) {
        const {
            twoFactorToken,
            otp,
        } = req.body;

        const result =
            await this.userService.verifyTwoFactor(
                twoFactorToken,
                otp
            );

        return sendSuccess(
            res,
            result,
            "Two-factor authentication successful"
        );
    }

    async forgotPassword(
        req: Request,
        res: Response
    ) {
        const { email } = req.body;

        await this.userService.forgotPassword(email);

        return sendSuccess(
            res,
            undefined,
            "If an account exists with this email, a password reset code has been sent."
        );
    }

    async verifyResetOtp(
        req: Request,
        res: Response
    ) {
        const { email, otp } = req.body;

        const resetToken =
            await this.userService.verifyResetOtp(
                email,
                otp
            );

        return sendSuccess(
            res,
            { resetToken },
            "Password reset code verified successfully"
        );
    }

    async resetPassword(
        req: Request,
        res: Response
    ) {
        const {
            resetToken,
            newPassword,
        } = req.body;

        await this.userService.resetPassword(
            resetToken,
            newPassword
        );

        return sendSuccess(
            res,
            undefined,
            "Password reset successfully"
        );
    }

    async refreshAccessToken(req: Request, res: Response) {
        const { refreshToken } = req.body;

        const result = await this.userService.refreshAccessToken(
            refreshToken
        );

        return sendSuccess(
            res,
            result,
            "Access token refreshed successfully"
        );
    }

    async logout(req: Request, res: Response) {
        const { refreshToken } = req.body;

        await this.userService.logout(
            refreshToken
        );

        return sendSuccess(
            res,
            undefined,
            "Logged Out of device successfully"
        );
    }
}