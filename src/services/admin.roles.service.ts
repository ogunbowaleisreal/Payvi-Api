import { prisma } from "../config/prisma.js";
import { AdminRoleRepository } from "../repository/admin.role.repository.js";
import { AdminPermissionRepository } from "../repository/permissions.repository.js";
import { AdminRolePermissionRepository } from "../repository/admin.role.permission.repository.js";
import type { CreateAdminRoleInput } from "../interfaces/admin.roles.interface.js";
import { AppError } from "../utils/app-error.js";

export class AdminRoleService {
    private adminRoleRepository: AdminRoleRepository;
    private adminPermissionRepository: AdminPermissionRepository;

    constructor() {
        this.adminRoleRepository =
            new AdminRoleRepository();

        this.adminPermissionRepository =
            new AdminPermissionRepository();

        // this.adminRolePermissionRepository =
        //     new AdminRolePermissionRepository();
    }

    async createRole(input: CreateAdminRoleInput) {
        const {
            name,
            description,
            permissions,
        } = input;

        const existingRole =
            await this.adminRoleRepository.findRoleByName(name);

        if (existingRole) {
            throw new AppError(
                "Role already exists",
                409
            );
        }

        const permissionRecords =
            await this.adminPermissionRepository.findPermissionsByNames(
                permissions
            );

        if (
            permissionRecords.length !==
            permissions.length
        ) {
            throw new AppError(
                "One or more permissions do not exist",
                400
            );
        }

        const role = await prisma.$transaction(
            async (tx) => {
                const roleRepository =
                    new AdminRoleRepository(tx);

                const rolePermissionRepository =
                    new AdminRolePermissionRepository(tx);

                const createdRole =
                    await roleRepository.createRole(
                        name,
                        description
                    );

                await rolePermissionRepository
                    .assignPermissionsToRole(
                        createdRole.id,
                        permissionRecords.map(
                            (permission) => permission.id
                        )
                    );

                return createdRole;
            }
        );

        return role;
    }

    async getAllRoles() {
        return this.adminRoleRepository.findAllRoles();
    }

    async getRoleById(id: number) {
        const role =
            await this.adminRoleRepository
                .findRoleByIdWithPermissions(id);

        if (!role) {
            throw new AppError(
                "Admin role not found",
                404
            );
        }

        return {
            id: role.id,
            name: role.name,
            description: role.description,
            permissions: role.permissions.map(
                (item) => item.permission
            ),
            createdAt: role.createdAt,
            updatedAt: role.updatedAt,
        };
    }

    async getAllPermissions() {
        return this.adminPermissionRepository
            .findAllPermissions();
    }
}


