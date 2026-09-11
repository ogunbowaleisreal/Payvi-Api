import { AdminRepository } from "../../repository/admin.repository.js";
import { AdminRoleRepository } from "../../repository/admin.role.repository.js";
import { hashPassword } from "../../utils/password.utils.js";
import { AppError } from "../../utils/app-error.js";

import type {
    CreateAdminInput,
    UpdateAdminInput,
    AssignAdminRoleInput,
} from "../../interfaces/admin/admin.interfaces.js";

export class AdminService {
    private adminRepository: AdminRepository;
    private adminRoleRepository: AdminRoleRepository;

    constructor() {
        this.adminRepository = new AdminRepository();
        this.adminRoleRepository =
            new AdminRoleRepository();
    }

    async createAdmin(input: CreateAdminInput) {
        const {
            name,
            email,
            password,
            roleId,
        } = input;

        const existingAdmin =
            await this.adminRepository.findAdminByEmail(
                email
            );

        if (existingAdmin) {
            throw new AppError(
                "Admin with this email already exists",
                409
            );
        }

        const role =
            await this.adminRoleRepository.findRoleById(
                roleId
            );

        if (!role) {
            throw new AppError(
                "Admin role not found",
                404
            );
        }

        const passwordHash =
            await hashPassword(password);

        const admin =
            await this.adminRepository.createAdmin(
                name,
                email,
                passwordHash,
                roleId
            );

        return {
            id: admin.id,
            name: admin.name,
            email: admin.email,
            roleId: admin.roleId,
            isActive: admin.isActive,
            createdAt: admin.createdAt,
        };
    }

    async getAllAdmins() {
        return this.adminRepository.findAllAdmins();
    }

    async getAdminById(id: number) {
        const admin =
            await this.adminRepository
                .findAdminByIdWithRole(id);

        if (!admin) {
            throw new AppError(
                "Admin account not found",
                404
            );
        }

        return admin;
    }

    async updateAdmin(
        id: number,
        input: UpdateAdminInput
    ) {
        const admin =
            await this.adminRepository.findAdminById(id);

        if (!admin) {
            throw new AppError(
                "Admin account not found",
                404
            );
        }

        if (input.email) {
            const existingAdmin =
                await this.adminRepository
                    .findAdminByEmail(input.email);

            if (
                existingAdmin &&
                existingAdmin.id !== id
            ) {
                throw new AppError(
                    "Admin with this email already exists",
                    409
                );
            }
        }

        return this.adminRepository.updateAdmin(
            id,
            input
        );
    }

    async assignRole(
        id: number,
        input: AssignAdminRoleInput
    ) {
        const admin =
            await this.adminRepository.findAdminById(id);

        if (!admin) {
            throw new AppError(
                "Admin account not found",
                404
            );
        }

        if (admin.isSuperAdmin) {
            throw new AppError(
                "Super Admin role cannot be changed",
                403
            );
        }

        const role =
            await this.adminRoleRepository.findRoleById(
                input.roleId
            );

        if (!role) {
            throw new AppError(
                "Admin role not found",
                404
            );
        }

        return this.adminRepository.updateAdminRole(
            id,
            input.roleId
        );
    }

    async deactivateAdmin(id: number) {
        const admin =
            await this.adminRepository.findAdminById(id);

        if (!admin) {
            throw new AppError(
                "Admin account not found",
                404
            );
        }

        if (admin.isSuperAdmin) {
            throw new AppError(
                "Super Admin cannot be deactivated",
                403
            );
        }

        if (!admin.isActive) {
            throw new AppError(
                "Admin account is already inactive",
                400
            );
        }

        return this.adminRepository.deactivateAdmin(
            id
        );
    }
}