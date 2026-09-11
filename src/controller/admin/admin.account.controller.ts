import type { Response } from "express";

import type {
    AdminAuthenticatedRequest,
} from "../../middleware/admin.auth.middleware.js";

import { AdminService } from "../../services/admin/admin.account.service.js";

import {
    sendCreated,
    sendSuccess,
} from "../../utils/response.utils.js";

import type {
    CreateAdminInput,
    UpdateAdminInput,
    AssignAdminRoleInput,
} from "../../interfaces/admin/admin.interfaces.js";

export class AdminController {
    private adminService: AdminService;

    constructor() {
        this.adminService = new AdminService();
    }

    async createAdmin(
        req: AdminAuthenticatedRequest,
        res: Response
    ) {
        const input =
            req.body as CreateAdminInput;

        const admin =
            await this.adminService.createAdmin(
                input
            );

        return sendCreated(
            res,
            admin,
            "Admin created successfully"
        );
    }

    async getAllAdmins(
        _req: AdminAuthenticatedRequest,
        res: Response
    ) {
        const admins =
            await this.adminService.getAllAdmins();

        return sendSuccess(
            res,
            admins,
            "Admins retrieved successfully"
        );
    }

    async getAdminById(
        req: AdminAuthenticatedRequest,
        res: Response
    ) {
        const id = Number(req.params.id);

        const admin =
            await this.adminService.getAdminById(id);

        return sendSuccess(
            res,
            admin,
            "Admin retrieved successfully"
        );
    }

    async updateAdmin(
        req: AdminAuthenticatedRequest,
        res: Response
    ) {
        const id = Number(req.params.id);

        const input =
            req.body as UpdateAdminInput;

        const admin =
            await this.adminService.updateAdmin(
                id,
                input
            );

        return sendSuccess(
            res,
            admin,
            "Admin updated successfully"
        );
    }

    async assignRole(
        req: AdminAuthenticatedRequest,
        res: Response
    ) {
        const id = Number(req.params.id);

        const input =
            req.body as AssignAdminRoleInput;

        const admin =
            await this.adminService.assignRole(
                id,
                input
            );

        return sendSuccess(
            res,
            admin,
            "Admin role updated successfully"
        );
    }

    async deactivateAdmin(
        req: AdminAuthenticatedRequest,
        res: Response
    ) {
        const id = Number(req.params.id);

        await this.adminService.deactivateAdmin(
            id
        );

        return sendSuccess(
            res,
            undefined,
            "Admin deactivated successfully"
        );
    }
}