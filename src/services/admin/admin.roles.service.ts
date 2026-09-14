import { prisma } from "../../config/prisma.js";
import { AdminRoleRepository } from "../../repository/admin.role.repository.js";
import { AdminPermissionRepository } from "../../repository/permissions.repository.js";
import { AdminRolePermissionRepository } from "../../repository/admin.role.permission.repository.js";
import type { CreateAdminRoleInput, UpdateRolePermissionsInput, UpdateAdminRoleInput } from "../../interfaces/admin/admin.roles.interface.js";
import { AppError } from "../../utils/app-error.js";
import { AdminRepository } from "../../repository/admin.repository.js";
import { logger } from "../../logger/logger.js";

export class AdminRoleService {
    private adminRoleRepository: AdminRoleRepository;
    private adminPermissionRepository: AdminPermissionRepository;
    private adminRepository: AdminRepository;

    constructor() {
        this.adminRoleRepository =
            new AdminRoleRepository();

        this.adminPermissionRepository =
            new AdminPermissionRepository();

        this.adminRepository =
            new AdminRepository();


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
            logger.error("Role already exists", { name });
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
            logger.error("One or more permissions do not exist", { permissions });
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
            logger.error("Admin role not found", { id });
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

    async updateRole(
        id: number,
        input: UpdateAdminRoleInput
    ) {
        const existingRole =
            await this.adminRoleRepository.findRoleById(id);

        if (!existingRole) {
            logger.error("Admin role not found", { id });
            throw new AppError(
                "Admin role not found",
                404
            );
        }

        const roleWithSameName =
            await this.adminRoleRepository.findRoleByName(
                input.name
            );

        if (
            roleWithSameName &&
            roleWithSameName.id !== id
        ) {
            logger.error("Role name already exists", { name: input.name });
            throw new AppError(
                "Role name already exists",
                409
            );
        }

        return this.adminRoleRepository.updateRole(
            id,
            input.name,
            input.description
        );
    }

    async updateRolePermissions(
        roleId: number,
        input: UpdateRolePermissionsInput
    ) {
        const role =
            await this.adminRoleRepository.findRoleById(
                roleId
            );

        if (!role) {
            logger.error("Admin role not found", { id: roleId });
            throw new AppError(
                "Admin role not found",
                404
            );
        }

        const permissionRecords =
            await this.adminPermissionRepository
                .findPermissionsByNames(
                    input.permissions
                );

        if (
            permissionRecords.length !==
            input.permissions.length
        ) {
            logger.error("One or more permissions do not exist", { permissions: input.permissions });
            throw new AppError(
                "One or more permissions do not exist",
                400
            );
        }

        await prisma.$transaction(
            async (tx) => {
                const rolePermissionRepository =
                    new AdminRolePermissionRepository(tx);

                await rolePermissionRepository
                    .replaceRolePermissions(
                        roleId,
                        permissionRecords.map(
                            (permission) => permission.id
                        )
                    );
            }
        );

        return this.getRoleById(roleId);
    }

    async deleteRole(id: number) {
        const role =
            await this.adminRoleRepository.findRoleById(id);

        if (!role) {
            logger.error("Admin role not found", { id });
            throw new AppError(
                "Admin role not found",
                404
            );
        }

        const adminCount =
            await this.adminRepository.countAdminsByRoleId(
                id
            );

        if (adminCount > 0) {
            logger.error("Cannot delete a role assigned to administrators");
            throw new AppError(
                "Cannot delete a role assigned to administrators",
                409
            );
        }

        await this.adminRoleRepository.deleteRole(id);
    }

    async getAllPermissions() {
        return this.adminPermissionRepository
            .findAllPermissions();
    }
}


