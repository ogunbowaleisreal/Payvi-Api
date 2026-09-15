import { z } from "zod";

const envSchema = z.object({
    NODE_ENV: z
        .enum(["development", "test", "production"])
        .default("development"),

    PORT: z.coerce
        .number()
        .int()
        .positive()
        .default(3000),

    DATABASE_URL: z.string().min(1),
    REDIS_URL: z.string().min(1),

    ADMIN_ACCESS_TOKEN_SECRET: z.string().min(1),
    ADMIN_REFRESH_TOKEN_SECRET: z.string().min(1),
    REFRESH_TOKEN_SECRET: z.string().min(1),
    ACCESS_TOKEN_SECRET: z.string().min(1),
    COMPANY_NAME: z.string().min(1),
    COMPANY_PRIMARY_COLOR: z.string().min(1),
    COMPANY_LOGO_URL: z.string().min(1),
    COMPANY_WEBSITE_URL: z.string().min(1),
    COMPANY_SUPPORT_EMAIL: z.string().min(1),

    BREVO_API_KEY: z.string().min(1),
    EMAIL_FROM: z.string().email(),
});

export const env = envSchema.parse(process.env);