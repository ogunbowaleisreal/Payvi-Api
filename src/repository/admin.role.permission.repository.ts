import { prisma } from "../config/prisma.js";
import type { PrismaClient } from "../generated/prisma/client.js";

type AdminRolePermissionDb = Pick<
    PrismaClient,
    "adminRolePermission"
>;

export class AdminRolePermissionRepository {
    constructor(
        private db: AdminRolePermissionDb = prisma
    ) { }

    async assignPermissionToRole(
        roleId: number,
        permissionId: number
    ) {
        return this.db.adminRolePermission.upsert({
            where: {
                roleId_permissionId: {
                    roleId,
                    permissionId,
                },
            },
            update: {},
            create: {
                roleId,
                permissionId,
            },
        });
    }

    async replaceRolePermissions(
        roleId: number,
        permissionIds: number[]
    ) {
        await this.db.adminRolePermission.deleteMany({
            where: {
                roleId,
            },
        });

        if (permissionIds.length === 0) {
            return;
        }

        await this.db.adminRolePermission.createMany({
            data: permissionIds.map((permissionId) => ({
                roleId,
                permissionId,
            })),
            skipDuplicates: true,
        });
    }

    async removePermissionFromRole(
        roleId: number,
        permissionId: number
    ) {
        return this.db.adminRolePermission.delete({
            where: {
                roleId_permissionId: {
                    roleId,
                    permissionId,
                },
            },
        });
    }

    async findRolePermissions(roleId: number) {
        return this.db.adminRolePermission.findMany({
            where: {
                roleId,
            },
            include: {
                permission: true,
            },
        });
    }

    async hasPermission(
        roleId: number,
        permissionName: string
    ) {
        const result =
            await this.db.adminRolePermission.findFirst({
                where: {
                    roleId,
                    permission: {
                        name: permissionName,
                    },
                },
            });

        return result !== null;
    }

    async hasPermissions(
        roleId: number,
        permissionNames: string[]
    ) {
        const permissions =
            await this.db.adminRolePermission.findMany({
                where: {
                    roleId,
                    permission: {
                        name: {
                            in: permissionNames,
                        },
                    },
                },
                select: {
                    permission: {
                        select: {
                            name: true,
                        },
                    },
                },
            });

        return (
            permissions.length ===
            permissionNames.length
        );
    }

    async assignPermissionsToRole(
        roleId: number,
        permissionIds: number[]
    ) {
        return this.db.adminRolePermission.createMany({
            data: permissionIds.map((permissionId) => ({
                roleId,
                permissionId,
            })),
            skipDuplicates: true,
        });
    }
}