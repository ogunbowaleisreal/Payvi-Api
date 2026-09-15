import { UserRepository } from "../../repository/user.repository.js";
import type { CreateUserInput, LoginUserInput } from "../../interfaces/users/user.interface.js";
import { SessionRepository } from "../../repository/session.repository.js";
import { hashPassword, comparePassword, } from "../../utils/password.utils.js";
import { AppError } from "../../utils/app-error.js";
import { randomUUID } from "node:crypto";
import { hashToken } from "../../utils/hash.utils.js";
import {
    generateAccessToken,
    generateRefreshToken,
    generateTwoFactorToken,
    verifyTwoFactorToken,
    verifyRefreshToken
} from "../../utils/jwt.utils.js";
import { OtpService } from "../shared/otp.service.js";
import { EmailService } from "../shared/email.service.js";
import { OtpType } from "../../interfaces/otp.interface.js";
import { verificationOtpTemplate } from "../../templates/email/verification-otp.templates.js";
import { passwordResetOtpTemplate } from "../../templates/email/password-reset-otp.templates.js";
import { twoFactorOtpTemplate } from "../../templates/email/two-factor-otp.templates.js";
import { toUserResponse } from "../../utils/user.utils.js";
import { generateRandomToken } from "../../utils/user.utils.js";
import { RedisService } from "../shared/redis.service.js";
import { logger } from "../../logger/logger.js";
import { normalizeEmail } from "../../validators/general.validators.js";


export class UserService {

    private userRepository: UserRepository;
    private sessionRepository: SessionRepository;
    private otpService: OtpService;
    private emailService: EmailService;
    private redisService: RedisService

    constructor() {
        this.userRepository = new UserRepository();
        this.sessionRepository = new SessionRepository();
        this.otpService = new OtpService();
        this.emailService = new EmailService();
        this.redisService = new RedisService()
    }

    async registerUser(userData: CreateUserInput) {
        if (!userData.firstName) {
            logger.error("Name is required");
            throw new AppError("firstName is required", 400);
        }
        if (!userData.lastName) {
            logger.error("Name is required");
            throw new AppError("lastName is required", 400);
        }
        if (!userData.email) {
            logger.error("Email is required");
            throw new AppError("Email is required", 400);
        }

        if (!userData.password) {
            logger.error("Password is required");
            throw new AppError("Password is required", 400);
        }

        if (userData.password.length < 8) {
            logger.error("Password must be at least 8 characters");
            throw new AppError(
                "Password must be at least 8 characters",
                400
            );
        }
        const normalizedEmail = normalizeEmail(userData.email);

        const hashedPassword = await hashPassword(userData.password);

        const actualData = {
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: normalizedEmail,
            passwordHash: hashedPassword,
        };

        const user = await this.userRepository.createUser(actualData);

        const otp = await this.otpService.generateOtp(
            user.email,
            OtpType.EMAIL_VERIFICATION
        );

        const email = verificationOtpTemplate(otp);

        await this.emailService.sendEmail({
            to: user.email,
            ...email,
        });

        return toUserResponse(user);

    }


    async verifyEmail(
        email: string,
        otp: string
    ): Promise<void> {
        const user =
            await this.userRepository.findUserByEmail(email);

        if (!user) {
            throw new AppError("User not found", 404);
        }

        if (user.isVerified) {
            throw new AppError(
                "Email is already verified",
                400
            );
        }

        await this.otpService.verifyOtp(
            email,
            OtpType.EMAIL_VERIFICATION,
            otp
        );

        await this.userRepository.verifyUser(user.id);
    }

    async resendVerificationOtp(
        email: string
    ): Promise<void> {
        const user =
            await this.userRepository.findUserByEmail(email);

        if (!user) {
            throw new AppError("User not found", 404);
        }

        if (user.isVerified) {
            logger.error("Email is already verified", { email });
            throw new AppError(
                "Email is already verified",
                400
            );
        }

        const otp = await this.otpService.generateOtp(
            email,
            OtpType.EMAIL_VERIFICATION
        );

        const emailContent =
            verificationOtpTemplate(otp);

        await this.emailService.sendEmail({
            to: email,
            ...emailContent,
        });
    }

    async forgotPassword(email: string): Promise<void> {
        const user =
            await this.userRepository.findUserByEmail(email);

        // Don't reveal whether the account exists.
        if (!user) {
            return;
        }

        const otp = await this.otpService.generateOtp(
            email,
            OtpType.PASSWORD_RESET
        );

        const emailContent =
            passwordResetOtpTemplate(otp);

        await this.emailService.sendEmail({
            to: email,
            ...emailContent,
        });
    }

    async verifyResetOtp(
        email: string,
        otp: string
    ): Promise<string> {
        const user =
            await this.userRepository.findUserByEmail(email);

        if (!user) {
            logger.error("User not found", { email });
            throw new AppError(
                "Invalid password reset request",
                400
            );
        }

        await this.otpService.verifyOtp(
            email,
            OtpType.PASSWORD_RESET,
            otp
        );

        const resetToken = generateRandomToken();

        const key =
            `password_reset:${resetToken}`;

        await this.redisService.setWithExpiry(
            key,
            user.id.toString(),
            600
        );

        return resetToken;
    }


    async resetPassword(
        resetToken: string,
        newPassword: string
    ): Promise<void> {
        const key = `password_reset:${resetToken}`;

        const userId =
            await this.redisService.get(key);

        if (!userId) {
            logger.error("Invalid or expired password reset token");
            throw new AppError(
                "Invalid or expired password reset token",
                400
            );
        }

        const passwordHash =
            await hashPassword(newPassword);

        await this.userRepository.updatePasswordHash(
            Number(userId),
            passwordHash
        );

        await this.sessionRepository.revokeAllUserSessions(
            Number(userId)
        );

        await this.redisService.delete(key);
    }

    async login(input: LoginUserInput) {
        const user = await this.userRepository.findUserByEmail(input.email);

        if (!user) {
            logger.error("User not found", { email: input.email });
            throw new AppError("Invalid email or password", 401);
        }

        const passwordValid = await comparePassword(
            input.password,
            user.passwordHash
        );

        if (!passwordValid) {
            logger.error("Invalid password", { email: input.email });
            throw new AppError("Invalid email or password", 401);
        }

        if (user.twoFactorEnabled) {
            const otp = await this.otpService.generateOtp(
                user.email,
                OtpType.TWO_FACTOR_AUTH
            );

            const emailContent =
                twoFactorOtpTemplate(otp);

            await this.emailService.sendEmail({
                to: user.email,
                ...emailContent,
            });

            const twoFactorToken =
                generateTwoFactorToken(user.id);

            return {
                requiresTwoFactor: true,
                twoFactorToken,
            };
        }

        const sessionId = randomUUID();

        const refreshToken = generateRefreshToken(
            user.id,
            sessionId
        );

        const refreshTokenHash = hashToken(refreshToken);

        const expiresAt = new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000
        );

        await this.sessionRepository.createSession(
            sessionId,
            user.id,
            refreshTokenHash,
            expiresAt
        );

        const accessToken = generateAccessToken(user.id);

        await this.userRepository.updateLastLogin(user.id);

        return {
            accessToken,
            refreshToken,
            user: toUserResponse(user)
        };
    }

    async verifyTwoFactor(
        twoFactorToken: string,
        otp: string
    ) {
        const payload =
            verifyTwoFactorToken(twoFactorToken);

        const user =
            await this.userRepository.findUserById(
                payload.userId
            );

        if (!user) {
            throw new AppError(
                "User not found",
                404
            );
        }

        if (!user.twoFactorEnabled) {
            logger.info("Two-factor authentication is not enabled", { userId: user.id.toString() });
            throw new AppError(
                "Two-factor authentication is not enabled",
                400
            );
        }

        await this.otpService.verifyOtp(
            user.email,
            OtpType.TWO_FACTOR_AUTH,
            otp
        );

        const sessionId = randomUUID();

        const refreshToken =
            generateRefreshToken(
                user.id,
                sessionId
            );

        const refreshTokenHash =
            hashToken(refreshToken);

        const expiresAt =
            new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        await this.sessionRepository.createSession(
            sessionId,
            user.id,
            refreshTokenHash,
            expiresAt
        );

        const accessToken =
            generateAccessToken(user.id);

        await this.userRepository.updateLastLogin(
            user.id
        );

        return {
            accessToken,
            refreshToken,
            user: toUserResponse(user),
        };
    }

    async updateTwoFactorStatus(
        userId: number,
        enabled: boolean
    ): Promise<void> {
        await this.userRepository.updateTwoFactorStatus(
            userId,
            enabled
        );
    }

    async refreshAccessToken(refreshToken: string) {
        if (!refreshToken) {
            throw new AppError("Refresh token is required", 401);
        }

        let payload;

        try {
            payload = verifyRefreshToken(refreshToken);
        } catch {
            throw new AppError("Invalid or expired refresh token", 401);
        }

        const session = await this.sessionRepository.findSessionByIdAndUserId(
            payload.sessionId,
            payload.userId
        );

        if (!session) {
            throw new AppError("Invalid or revoked session", 401);
        }

        if (session.expiresAt <= new Date()) {
            logger.info("Session has expired", { sessionId: session.id });
            throw new AppError("Session has expired", 401);
        }


        const refreshTokenHash = hashToken(refreshToken);

        if (refreshTokenHash !== session.refreshTokenHash) {
            logger.info("Invalid refresh token", { sessionId: session.id });
            throw new AppError("Invalid refresh token", 401);
        }

        // Revoke the old session
        await this.sessionRepository.revokeSession(
            session.id
        );

        // Create a new session
        const newSessionId = randomUUID();

        const newRefreshToken = generateRefreshToken(
            payload.userId,
            newSessionId
        );

        const newRefreshTokenHash = hashToken(
            newRefreshToken
        );

        const newExpiresAt = new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000
        );

        await this.sessionRepository.createSession(
            newSessionId,
            payload.userId,
            newRefreshTokenHash,
            newExpiresAt
        );

        const accessToken = generateAccessToken(payload.userId);

        return {
            accessToken,
            refreshToken: newRefreshToken
        };
    }

    async logout(refreshToken: string) {
        if (!refreshToken) {
            logger.info("Refresh token is required");
            throw new AppError("Refresh token is required", 401);
        }

        let payload;

        try {
            payload = verifyRefreshToken(refreshToken);
        } catch {
            logger.error("Invalid or expired refresh token");
            throw new AppError(
                "Invalid or expired refresh token",
                401
            );
        }

        const session =
            await this.sessionRepository.findSessionByIdAndUserId(
                payload.sessionId,
                payload.userId
            );

        if (!session) {
            throw new AppError(
                "Invalid or revoked session",
                401
            );
        }

        const refreshTokenHash = hashToken(refreshToken);

        if (refreshTokenHash !== session.refreshTokenHash) {
            throw new AppError("Invalid refresh token", 401);
        }

        await this.sessionRepository.revokeSession(
            session.id
        );
    }
}