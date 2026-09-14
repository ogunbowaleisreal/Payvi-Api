import winston from 'winston';
import { LoggerRepository } from './logger.repository.js';
import type { LogContext, LogLevel } from './logger.types.js';

const loggerRepository = new LoggerRepository();

const { combine, timestamp, json, colorize, printf } = winston.format;

const consoleFormat = combine(
    colorize(),
    timestamp(),
    printf(({ level, message, timestamp, ...meta }) => {
        const metadata =
            Object.keys(meta).length > 0
                ? ` ${JSON.stringify(meta)}`
                : '';

        return `[${timestamp}] ${level}: ${message}${metadata}`;
    }),
);

const winstonLogger = winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',

    format: combine(
        timestamp(),
        json(),
    ),

    transports: [
        new winston.transports.Console({
            format: consoleFormat,
        }),
    ],
});

class Logger {
    private async persist(
        level: LogLevel,
        message: string,
        context?: LogContext,
    ): Promise<void> {
        try {
            await loggerRepository.create({
                level,
                message,
                ...(context && { context }),
            });
        } catch (error) {
            winstonLogger.error('Failed to persist log', {
                error,
            });
        }
    }

    info(message: string, context?: LogContext): void {
        winstonLogger.info(message, context);

        void this.persist('info', message, context);
    }

    warn(message: string, context?: LogContext): void {
        winstonLogger.warn(message, context);

        void this.persist('warn', message, context);
    }

    error(message: string, context?: LogContext): void {
        winstonLogger.error(message, context);

        void this.persist('error', message, context);
    }

    debug(message: string, context?: LogContext): void {
        winstonLogger.debug(message, context);

        void this.persist('debug', message, context);
    }
}

export const logger = new Logger();