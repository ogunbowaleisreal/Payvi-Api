export interface CreateAdminInput {
    name: string;
    email: string;
    password: string;
    roleId: number;
}

export interface UpdateAdminInput {
    name?: string;
    email?: string;
}

export interface AssignAdminRoleInput {
    roleId: number;
}