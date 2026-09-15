import { prisma } from "../config/prisma.js";
import type { PrismaClient } from "../generated/prisma/client.js";

type AdminDb = Pick<PrismaClient, "admin">;

export class AdminRepository {
    constructor(private db: AdminDb = prisma) { }

    async createAdmin(
        firstName: string,
        lastName: string,
        email: string,
        passwordHash: string,
        roleId?: number
    ) {
        return this.db.admin.create({
            data: {
                firstName,
                lastName,
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

    async countAdminsByRoleId(roleId: number) {
        return this.db.admin.count({
            where: {
                roleId,
            },
        });
    }

    async findAllAdmins() {
        return this.db.admin.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                isSuperAdmin: true,
                isActive: true,
                lastLoginAt: true,
                role: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                createdAt: true,
                updatedAt: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });
    }

    async findAdminByIdWithRole(id: number) {
        return this.db.admin.findUnique({
            where: {
                id,
            },
            select: {
                id: true,
                name: true,
                email: true,
                isSuperAdmin: true,
                isActive: true,
                lastLoginAt: true,
                role: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                createdAt: true,
                updatedAt: true,
            },
        });
    }

    async updateAdmin(
        id: number,
        data: {
            name?: string;
            email?: string;
        }
    ) {
        return this.db.admin.update({
            where: {
                id,
            },
            data,
        });
    }

    async updateAdminRole(
        id: number,
        roleId: number
    ) {
        return this.db.admin.update({
            where: {
                id,
            },
            data: {
                roleId,
            },
        });
    }

    async findAdminForLogin(email: string) {
        return this.db.admin.findUnique({
            where: { email, },
            select: {
                id: true,
                firstName: true,
                lastName: true,
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