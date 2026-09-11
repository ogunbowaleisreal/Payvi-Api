import { prisma } from "../config/prisma.js";
import type { PrismaClient } from "../generated/prisma/client.js";

type AdminRoleDb = Pick<PrismaClient, "adminRole">;

export class AdminRoleRepository {
    constructor(private db: AdminRoleDb = prisma) { }

    async createRole(
        name: string,
        description?: string
    ) {
        return this.db.adminRole.create({
            data: {
                name,
                description: description ?? null,
            },
        });
    }

    async findRoleById(id: number) {
        return this.db.adminRole.findUnique({
            where: { id },
        });
    }

    async findRoleByName(name: string) {
        return this.db.adminRole.findUnique({
            where: { name },
        });
    }

    async findAllRoles() {
        return this.db.adminRole.findMany({
            orderBy: {
                name: "asc",
            },
        });
    }

    async updateRole(
        id: number,
        name: string,
        description?: string
    ) {
        return this.db.adminRole.update({
            where: {
                id,
            },
            data: {
                name,
                description: description ?? null,
            },
        });
    }

    async deleteRole(id: number) {
        return this.db.adminRole.delete({
            where: {
                id,
            },
        });
    }
    async findRoleByIdWithPermissions(id: number) {
        return this.db.adminRole.findUnique({
            where: {
                id,
            },
            select: {
                id: true,
                name: true,
                description: true,
                createdAt: true,
                updatedAt: true,
                permissions: {
                    select: {
                        permission: {
                            select: {
                                id: true,
                                name: true,
                                description: true,
                            },
                        },
                    },
                },
            },
        });
    }
}