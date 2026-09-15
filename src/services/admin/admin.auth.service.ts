import { AdminRepository } from "../../repository/admin.repository.js";
import { AdminSessionRepository } from "../../repository/admin.session.repository.js";
import { comparePassword } from "../../utils/password.utils.js";
import {
    generateAdminAccessToken,
    generateAdminRefreshToken,
} from "../../utils/jwt.utils.js";
import type { AdminLoginInput } from "../../interfaces/admin/admin.auth.interface.js";
import { AppError } from "../../utils/app-error.js";
import {
    hashToken,
} from "../../utils/hash.utils.js";
import { generateRandomToken } from "../../utils/user.utils.js";
import { verifyAdminRefreshToken } from "../../utils/jwt.utils.js";
import { logger } from "../../logger/logger.js";

export class AdminAuthService {
    private adminRepository: AdminRepository;
    private adminSessionRepository: AdminSessionRepository;

    constructor() {
        this.adminRepository = new AdminRepository();
        this.adminSessionRepository = new AdminSessionRepository();
    }

    async login(input: AdminLoginInput) {
        const { email, password } = input;

        const admin =
            await this.adminRepository.findAdminForLogin(
                email
            );

        if (!admin) {
            logger.error("Invalid email or password", { email });
            throw new AppError(
                "Invalid email or password",
                401
            );
        }

        if (!admin.isActive) {
            logger.error("Admin account is inactive", { email });
            throw new AppError(
                "Admin account is inactive",
                403
            );
        }

        const passwordValid =
            await comparePassword(
                password,
                admin.passwordHash
            );

        if (!passwordValid) {
            logger.error("Invalid email or password", { email });
            throw new AppError(
                "Invalid email or password",
                401
            );
        }

        await this.adminRepository.updateLastLogin(
            admin.id
        );
        const accessToken =
            generateAdminAccessToken(admin.id);

        const sessionId =
            generateRandomToken(32);

        const refreshToken =
            generateAdminRefreshToken(
                admin.id,
                sessionId
            );

        const refreshTokenHash =
            hashToken(refreshToken);

        const expiresAt = new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000
        );

        await this.adminSessionRepository.createSession(
            sessionId,
            admin.id,
            refreshTokenHash,
            expiresAt
        );
        const permissions = admin.isSuperAdmin ? ["*"] : admin.role?.permissions.map((item) => item.permission.name) ?? [];
        return {
            accessToken,
            refreshToken,
            admin: {
                id: admin.id,
                firstName: admin.firstName,
                lastName: admin.lastName,
                email: admin.email,
                isSuperAdmin: admin.isSuperAdmin,
                role: admin.role ?
                    { id: admin.role.id, name: admin.role.name, } : null, permissions,
            },
        };
    }

    async refreshAccessToken(refreshToken: string) {
        let payload;

        try {
            payload =
                verifyAdminRefreshToken(refreshToken);
        } catch {
            logger.error("Invalid or expired refresh token",);
            throw new AppError(
                "Invalid or expired refresh token",
                401
            );
        }

        const {
            adminId,
            sessionId,
        } = payload;

        const session =
            await this.adminSessionRepository
                .findActiveSession(
                    sessionId,
                    adminId
                );

        if (!session) {
            logger.error("Invalid refresh session", { sessionId, adminId });
            throw new AppError(
                "Invalid refresh session",
                401
            );
        }

        if (session.expiresAt <= new Date()) {
            logger.error("Refresh session has expired", { sessionId, adminId });
            throw new AppError(
                "Refresh session has expired",
                401
            );
        }

        const refreshTokenHash =
            hashToken(refreshToken);

        if (
            refreshTokenHash !==
            session.refreshTokenHash
        ) {
            logger.error("Invalid refresh token");
            throw new AppError(
                "Invalid refresh token",
                401
            );
        }

        const admin =
            await this.adminRepository.findAdminById(
                adminId
            );

        if (!admin) {
            logger.error("Admin account not found", { adminId });
            throw new AppError(
                "Admin account not found",
                401
            );
        }

        if (!admin.isActive) {
            logger.error("Admin account is inactive", { adminId });
            throw new AppError(
                "Admin account is inactive",
                403
            );
        }

        const accessToken =
            generateAdminAccessToken(admin.id);

        return {
            accessToken,
        };
    }

    async logout(refreshToken: string) {
        let payload;

        try {
            payload =
                verifyAdminRefreshToken(refreshToken);
        } catch {
            logger.error("Invalid or expired refresh token");
            throw new AppError(
                "Invalid or expired refresh token",
                401
            );
        }

        const { adminId, sessionId } = payload;

        const session =
            await this.adminSessionRepository
                .findActiveSession(
                    sessionId,
                    adminId
                );

        if (!session) {
            throw new AppError(
                "Invalid refresh session",
                401
            );
        }

        const refreshTokenHash =
            hashToken(refreshToken);

        if (
            refreshTokenHash !==
            session.refreshTokenHash
        ) {
            throw new AppError(
                "Invalid refresh token",
                401
            );
        }

        await this.adminSessionRepository
            .revokeSession(sessionId);
    }

}
