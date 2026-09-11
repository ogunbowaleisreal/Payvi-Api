import { prisma } from "../config/prisma.js";
import type { PrismaClient } from "../generated/prisma/client.js";

type AdminPermissionDb = Pick<
    PrismaClient,
    "adminPermission"
>;

export class AdminPermissionRepository {
    constructor(
        private db: AdminPermissionDb = prisma
    ) { }

    async findPermissionById(id: number) {
        return this.db.adminPermission.findUnique({
            where: { id },
        });
    }

    async findPermissionByName(name: string) {
        return this.db.adminPermission.findUnique({
            where: { name },
        });
    }

    async findAllPermissions() {
        return this.db.adminPermission.findMany({
            orderBy: {
                name: "asc",
            },
        });
    }

    async findPermissionsByNames(names: string[]) {
        return this.db.adminPermission.findMany({
            where: {
                name: {
                    in: names,
                },
            },
        });
    }
}
// import { prisma } from "../config/prisma.js";

// export class AdminPermissionRepository {
//     async findPermissionById(id: number) {
//         return prisma.adminPermission.findUnique({
//             where: { id },
//         });
//     }

//     async findPermissionByName(name: string) {
//         return prisma.adminPermission.findUnique({
//             where: { name },
//         });
//     }

//     async findAllPermissions() {
//         return prisma.adminPermission.findMany({
//             orderBy: {
//                 name: "asc",
//             },
//         });
//     }
//     async findPermissionsByNames(names: string[]) {
//         return prisma.adminPermission.findMany({
//             where: {
//                 name: {
//                     in: names,
//                 },
//             },
//         });
//     }

//     async assignPermissionsToRole(
//         roleId: number,
//         permissionIds: number[]
//     ) {
//         return prisma.adminRolePermission.createMany({
//             data: permissionIds.map((permissionId) => ({
//                 roleId,
//                 permissionId,
//             })),
//             skipDuplicates: true,
//         });
//     }
// }