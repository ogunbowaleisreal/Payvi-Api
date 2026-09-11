import { prisma } from "../config/prisma.js";
import type { PrismaClient } from "../generated/prisma/client.js";

type AdminSessionDb = Pick<
    PrismaClient,
    "adminSession"
>;

export class AdminSessionRepository {
    constructor(
        private db: AdminSessionDb = prisma
    ) { }

    async createSession(
        id: string,
        adminId: number,
        refreshTokenHash: string,
        expiresAt: Date
    ) {
        return this.db.adminSession.create({
            data: {
                id,
                adminId,
                refreshTokenHash,
                expiresAt,
            },
        });
    }

    async findSessionById(id: string) {
        return this.db.adminSession.findUnique({
            where: {
                id,
            },
        });
    }

    async findActiveSession(
        id: string,
        adminId: number
    ) {
        return this.db.adminSession.findFirst({
            where: {
                id,
                adminId,
                revokedAt: null,
            },
        });
    }

    async revokeSession(id: string) {
        return this.db.adminSession.update({
            where: {
                id,
            },
            data: {
                revokedAt: new Date(),
            },
        });
    }

    async revokeAllAdminSessions(adminId: number) {
        return this.db.adminSession.updateMany({
            where: {
                adminId,
                revokedAt: null,
            },
            data: {
                revokedAt: new Date(),
            },
        });
    }
}