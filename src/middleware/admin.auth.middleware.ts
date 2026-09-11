import type {
    Request,
    Response,
    NextFunction,
} from "express";

import { verifyAdminAccessToken } from "../utils/jwt.utils.js";
import { AppError } from "../utils/app-error.js";
import { AdminRolePermissionRepository } from "../repository/admin.role.permission.repository.js";

export interface AdminAuthenticatedRequest
    extends Request {
    adminId?: number;
}

export const authenticateAdmin = (
    req: AdminAuthenticatedRequest,
    _res: Response,
    next: NextFunction
) => {
    const authorization =
        req.headers.authorization;

    if (!authorization) {
        return next(
            new AppError(
                "Authentication required",
                401
            )
        );
    }

    const [scheme, token] =
        authorization.split(" ");

    if (
        scheme !== "Bearer" ||
        !token
    ) {
        return next(
            new AppError(
                "Invalid authorization header",
                401
            )
        );
    }

    try {
        const payload =
            verifyAdminAccessToken(token);

        req.adminId = payload.adminId;

        next();
    } catch {
        next(
            new AppError(
                "Invalid or expired access token",
                401
            )
        );
    }
};

import { AdminRepository } from "../repository/admin.repository.js";
export const authorizeAdmin = (
    requiredPermissions: string[]
) => {
    return async (
        req: AdminAuthenticatedRequest,
        _res: Response,
        next: NextFunction
    ) => {
        try {
            if (!req.adminId) {
                return next(
                    new AppError(
                        "Authentication required",
                        401
                    )
                );
            }

            const adminRepository =
                new AdminRepository();

            const admin =
                await adminRepository.findAdminById(
                    req.adminId
                );

            if (!admin) {
                return next(
                    new AppError(
                        "Admin account not found",
                        401
                    )
                );
            }

            if (!admin.isActive) {
                return next(
                    new AppError(
                        "Admin account is inactive",
                        403
                    )
                );
            }

            if (admin.isSuperAdmin) {
                return next();
            }

            if (!admin.roleId) {
                return next(
                    new AppError(
                        "Admin role is not assigned",
                        403
                    )
                );
            }

            const rolePermissionRepository =
                new AdminRolePermissionRepository();

            const hasPermissions =
                await rolePermissionRepository.hasPermissions(
                    admin.roleId,
                    requiredPermissions
                );

            if (!hasPermissions) {
                return next(
                    new AppError(
                        "You do not have permission to perform this action",
                        403
                    )
                );
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};