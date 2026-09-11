import { prisma } from "../config/prisma.js";

export class SessionRepository {
    async createSession(
        id: string,
        userId: number,
        refreshTokenHash: string,
        expiresAt: Date
    ) {
        return prisma.session.create({
            data: {
                id,
                userId,
                refreshTokenHash,
                expiresAt,
            },
        });
    }


    async findSessionById(id: string) {
        return prisma.session.findUnique({
            where: {
                id,
            },
        });
    }

    async findSessionByIdAndUserId(id: string, userId: number) {
        return prisma.session.findFirst({
            where: {
                id,
                userId,
                revokedAt: null,
            },
        });
    }

    async revokeSession(id: string) {
        return prisma.session.update({
            where: {
                id,
            },
            data: {
                revokedAt: new Date(),
            },
        });
    }

    async revokeAllUserSessions(userId: number) {
        return prisma.session.updateMany({
            where: {
                userId,
                revokedAt: null,
            },
            data: {
                revokedAt: new Date(),
            },
        });
    }
}