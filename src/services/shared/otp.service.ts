import { randomInt } from "node:crypto";
import { RedisService } from "./redis.service.js";
import { AppError } from "../../utils/app-error.js";
import { OtpType } from "../../interfaces/otp.interface.js";
import { logger } from "../../logger/logger.js";
export class OtpService {
    private redisService: RedisService;

    constructor() {
        this.redisService = new RedisService();
    }

    private generateOtpCode(): string {
        return randomInt(100000, 1000000).toString();
    }

    private getOtpKey(
        identifier: string,
        type: OtpType
    ): string {
        return `otp:${type}:${identifier}`;
    }

    async generateOtp(
        identifier: string,
        type: OtpType,
        expiryInSeconds = 300
    ): Promise<string> {
        const otp = this.generateOtpCode();

        const key = this.getOtpKey(
            identifier,
            type
        );

        await this.redisService.setWithExpiry(
            key,
            otp,
            expiryInSeconds
        );

        return otp;
    }

    async verifyOtp(
        identifier: string,
        type: OtpType,
        otp: string
    ): Promise<void> {
        const key = this.getOtpKey(
            identifier,
            type
        );

        const storedOtp =
            await this.redisService.get(key);

        if (!storedOtp) {
            logger.error("OTP does not exist", { key });
            throw new AppError(
                "OTP has expired or does not exist",
                400
            );
        }

        if (storedOtp !== otp) {
            throw new AppError(
                "Invalid OTP",
                400
            );
        }

        await this.redisService.delete(key);
    }
}