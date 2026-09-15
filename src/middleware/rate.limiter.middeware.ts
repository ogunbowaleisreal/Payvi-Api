import type { Request, Response, NextFunction } from "express";
import { RedisService } from "../services/shared/redis.service.js";
import { logger } from "../logger/logger.js";

const redisService = new RedisService();

export interface RateLimitOptions {
    windowInSeconds: number;
    maxRequests: number;
    keyPrefix: string;
}

export const rateLimit = (options: RateLimitOptions) => {
    return async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const identifier = req.ip ?? "unknown";

            const key = `${options.keyPrefix}:${identifier}`;
            const currentCount = await redisService.incrementWithExpiry(
                key,
                options.windowInSeconds
            );

            if (currentCount > options.maxRequests) {
                logger.error("Rate limit exceeded", { key });
                res.status(429).json({
                    success: false,
                    message: "Too many requests. Please try again later.",
                });

                return;
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};