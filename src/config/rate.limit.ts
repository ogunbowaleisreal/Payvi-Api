import type { RateLimitOptions } from "../middleware/rate.limiter.middeware.js";

export const generalRateLimit: RateLimitOptions = {
    windowInSeconds: 60,
    maxRequests: 100,
    keyPrefix: "rate_limit:general",
};

export const loginRateLimit: RateLimitOptions = {
    windowInSeconds: 15 * 60,
    maxRequests: 5,
    keyPrefix: "rate_limit:login",
};

export const otpRequestRateLimit: RateLimitOptions = {
    windowInSeconds: 10 * 60,
    maxRequests: 3,
    keyPrefix: "rate_limit:otp-request",
};

export const otpVerificationRateLimit: RateLimitOptions = {
    windowInSeconds: 10 * 60,
    maxRequests: 5,
    keyPrefix: "rate_limit:otp-verify",
};

export const passwordResetRateLimit: RateLimitOptions = {
    windowInSeconds: 10 * 60,
    maxRequests: 3,
    keyPrefix: "rate_limit:password-reset",
};

export const authRateLimit: RateLimitOptions = {
    windowInSeconds: 15 * 60,
    maxRequests: 20,
    keyPrefix: "rate_limit:auth",
};