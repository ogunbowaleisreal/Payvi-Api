import type { Response } from "express";
import type {
    AdminAuthenticatedRequest,
} from "../middleware/admin.auth.middleware.js";

import { AdminRoleService } from "../services/admin.roles.service.js";

import {
    sendCreated,
    sendSuccess,
} from "../utils/response.utils.js";

import type {
    CreateAdminRoleInput,
} from "../interfaces/admin.roles.interface.js";

export class AdminRoleController {
    private adminRoleService: AdminRoleService;

    constructor() {
        this.adminRoleService = new AdminRoleService();
    }

    async createRole(
        req: AdminAuthenticatedRequest,
        res: Response
    ) {
        const input = req.body as CreateAdminRoleInput;

        const role = await this.adminRoleService.createRole(input);

        return sendCreated(
            res,
            role,
            "Admin role created successfully"
        );
    }

    async getAllRoles(
        _req: AdminAuthenticatedRequest,
        res: Response
    ) {
        const roles = await this.adminRoleService.getAllRoles();

        return sendSuccess(
            res,
            roles,
            "Admin roles retrieved successfully"
        );
    }

    async getRoleById(
        req: AdminAuthenticatedRequest,
        res: Response
    ) {
        const id = Number(req.params.id);

        const role = await this.adminRoleService.getRoleById(id);

        return sendSuccess(
            res,
            role,
            "Admin role retrieved successfully"
        );
    }

    async getAllPermissions(
        _req: AdminAuthenticatedRequest,
        res: Response
    ) {
        const permissions =
            await this.adminRoleService.getAllPermissions();

        return sendSuccess(
            res,
            permissions,
            "Admin permissions retrieved successfully"
        );
    }

}