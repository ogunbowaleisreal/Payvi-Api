import type { Request, Response, NextFunction } from "express";

import { AppError } from "../utils/app-error.js";
import { sendError } from "../utils/response.utils.js";

export const errorMiddleware = (
    err: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction
) => {
    console.error(err);

    if (err instanceof AppError) {
        return sendError(
            res,
            err.message,
            err.statusCode
        );
    }

    if (
        typeof err === "object" &&
        err !== null &&
        "code" in err &&
        err.code === "23505"
    ) {
        return sendError(
            res,
            "Email already registered",
            409
        );
    }

    return sendError(
        res,
        "Internal server error",
        500
    );
};