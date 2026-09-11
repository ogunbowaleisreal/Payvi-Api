export interface CreateAdminRoleInput {
    name: string;
    description?: string;
    permissions: string[];
}