import { prisma } from "../config/prisma.js";
import type { PrismaClient } from "../generated/prisma/client.js";

type AdminDb = Pick<PrismaClient, "admin">;

export class AdminRepository {
    constructor(private db: AdminDb = prisma) { }

    async createAdmin(
        name: string,
        email: string,
        passwordHash: string,
        roleId?: number
    ) {
        return this.db.admin.create({
            data: {
                name,
                email,
                passwordHash,
                roleId: roleId ?? null,
            },
        });
    }

    async findAdminById(id: number) {
        return this.db.admin.findUnique({
            where: { id },
        });
    }

    async findAdminByEmail(email: string) {
        return this.db.admin.findUnique({
            where: { email },
        });
    }

    async updateLastLogin(id: number) {
        return this.db.admin.update({
            where: { id },
            data: {
                lastLoginAt: new Date(),
            },
        });
    }

    async findAdminForLogin(email: string) {
        return this.db.admin.findUnique({
            where: { email, },
            select: {
                id: true,
                name: true,
                email: true,
                passwordHash: true,
                isSuperAdmin: true,
                isActive: true,
                role: {
                    select:
                    {
                        id: true, name: true, permissions:
                        {
                            select: {
                                permission:
                                {
                                    select:
                                        { name: true, },
                                },
                            },
                        },
                    },
                },
            },
        });
    }

    async deactivateAdmin(id: number) {
        return this.db.admin.update({
            where: { id },
            data: {
                isActive: false,
            },
        });
    }
}