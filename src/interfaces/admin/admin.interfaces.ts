export interface CreateAdminInput {
    firstName: string;
    lastName: string;
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