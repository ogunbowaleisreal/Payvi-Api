export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export interface LogContext {
    requestId?: string;
    userId?: string;
    method?: string;
    path?: string;
    statusCode?: number;
    duration?: number;
    [key: string]: unknown;
}