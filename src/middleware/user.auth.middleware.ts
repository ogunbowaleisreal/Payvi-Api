import type {
    Request,
    Response,
    NextFunction,
} from "express";

import { verifyAccessToken } from "../utils/jwt.utils.js";
import { AppError } from "../utils/app-error.js";

export interface ClientAuthenticatedRequest
    extends Request {
    userId?: number;
}

export const ClientAuthMiddleware = (
    req: ClientAuthenticatedRequest,
    _res: Response,
    next: NextFunction
) => {
    const authorization =
        req.headers.authorization;

    if (!authorization) {
        throw new AppError(
            "Authorization header required",
            401
        );
    }

    const [scheme, token] =
        authorization.split(" ");

    if (
        scheme !== "Bearer" ||
        !token
    ) {
        throw new AppError(
            "Invalid authorization format",
            401
        );
    }

    try {
        const payload =
            verifyAccessToken(token);

        req.userId = payload.userId;

        next();
    } catch {
        throw new AppError(
            "Invalid or expired token",
            401
        );
    }
};