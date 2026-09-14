import type { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'node:crypto';
import { logger } from '../logger/logger.js';

export const requestLogger = (
    req: Request,
    res: Response,
    next: NextFunction,
): void => {
    const requestId = randomUUID();

    const start = Date.now();

    res.setHeader('X-Request-ID', requestId);

    res.on('finish', () => {
        const duration = Date.now() - start;

        const context = {
            requestId,
            method: req.method,
            path: req.originalUrl,
            statusCode: res.statusCode,
            duration,
        };

        if (res.statusCode >= 500) {
            logger.error('HTTP request failed', context);
        } else if (res.statusCode >= 400) {
            logger.warn('HTTP request failed', context);
        } else {
            logger.info('HTTP request completed', context);
        }
    });

    next();
};