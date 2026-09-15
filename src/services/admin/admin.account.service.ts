import { AdminRepository } from "../../repository/admin.repository.js";
import { AdminRoleRepository } from "../../repository/admin.role.repository.js";
import { EmailService } from "../shared/email.service.js";
import { hashPassword } from "../../utils/password.utils.js";
import { AppError } from "../../utils/app-error.js";
import { logger } from "../../logger/logger.js";
import { normalizeEmail } from "../../validators/general.validators.js";
import { adminWelcomeTemplate } from "../../templates/email/admin.welcome.template.js";

import type {
    CreateAdminInput,
    UpdateAdminInput,
    AssignAdminRoleInput,
} from "../../interfaces/admin/admin.interfaces.js";

export class AdminService {
    private adminRepository: AdminRepository;
    private adminRoleRepository: AdminRoleRepository;
    private emailService: EmailService;

    constructor() {
        this.adminRepository = new AdminRepository();
        this.adminRoleRepository =
            new AdminRoleRepository();
        this.emailService = new EmailService();
    }

    async createAdmin(input: CreateAdminInput) {
        const {
            firstName,
            lastName,
            email,
            password,
            roleId,
        } = input;

        const normalizedEmail = normalizeEmail(email);

        const existingAdmin =
            await this.adminRepository.findAdminByEmail(
                normalizedEmail
            );

        if (existingAdmin) {
            logger.error("Admin with this email already exists", {
                email,
            });
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
            logger.error("Admin role not found",
                {
                    roleId,
                }
            )
            throw new AppError(
                "Admin role not found",
                404
            );
        }

        const passwordHash =
            await hashPassword(password);

        const admin =
            await this.adminRepository.createAdmin(
                firstName,
                lastName,
                normalizedEmail,
                passwordHash,
                roleId
            );

        try {
            const emailTemplate = adminWelcomeTemplate(
                admin.firstName,
                admin.email,
                password,
                role.name
            );

            await this.emailService.sendEmail({
                to: admin.email,
                subject: emailTemplate.subject,
                html: emailTemplate.html,
            });
        } catch (error) {
            logger.error("Failed to send admin welcome email", {
                error,
                adminId: admin.id,
                email: admin.email,
            });
        }
        return {
            id: admin.id,
            firstName: admin.firstName,
            lastName: admin.lastName,
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
            logger.error("Admin account not found", { id });
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
            const normalizedEmail = normalizeEmail(input.email);
            const existingAdmin =
                await this.adminRepository
                    .findAdminByEmail(normalizedEmail);

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