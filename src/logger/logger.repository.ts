import { prisma } from '../config/prisma.js';
import type { LogContext, LogLevel } from './logger.types.js';

interface CreateLogInput {
    level: LogLevel;
    message: string;
    context?: LogContext;
}

export class LoggerRepository {
    async create({
        level,
        message,
        context,
    }: CreateLogInput): Promise<void> {
        await prisma.log.create({
            data: {
                level,
                message,

                requestId: context?.requestId ?? null,
                userId: context?.userId ?? null,

                method: context?.method ?? null,
                path: context?.path ?? null,

                statusCode: context?.statusCode ?? null,
                duration: context?.duration ?? null,

                metadata: context
                    ? JSON.parse(JSON.stringify(context))
                    : null,
            },
        });
    }
}