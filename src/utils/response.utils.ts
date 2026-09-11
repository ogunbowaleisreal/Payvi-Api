import type { Response } from "express";

interface ResponseMeta {
    [key: string]: unknown;
}

export const sendSuccess = <T>(
    res: Response,
    data?: T,
    message = "Success",
    statusCode = 200,
    meta?: ResponseMeta
) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
        ...(meta && { meta }),
    });
};

export const sendCreated = <T>(
    res: Response,
    data?: T,
    message = "Created successfully"
) => {
    return sendSuccess(
        res,
        data,
        message,
        201
    );
};

export const sendNoContent = (res: Response) => {
    return res.status(204).send();
};

export const sendError = (
    res: Response,
    message = "An error occurred",
    statusCode = 500,
    errors?: unknown
) => {
    return res.status(statusCode).json({
        success: false,
        message,
        ...(errors !== undefined && { errors }),
    });
};