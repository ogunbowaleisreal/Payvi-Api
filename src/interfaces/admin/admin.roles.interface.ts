
export interface CreateAdminRoleInput {
    name: string;
    description?: string;
    permissions: string[];
}

export interface UpdateAdminRoleInput {
    name: string;
    description?: string;
}

export interface UpdateRolePermissionsInput {
    permissions: string[];
}