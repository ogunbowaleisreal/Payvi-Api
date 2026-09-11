import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { ADMIN_PERMISSIONS } from "../src/config/admin/permission.definition.js";
import { hashPassword } from "../src/utils/password.utils.js";

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
    adapter,
});

const seedPermissions = async () => {
    for (const permission of ADMIN_PERMISSIONS) {
        await prisma.adminPermission.upsert({
            where: {
                name: permission.name,
            },
            update: {
                description: permission.description,
            },
            create: {
                name: permission.name,
                description: permission.description,
            },
        });
    }
};

const seedSuperAdmin = async () => {
    const name = process.env.SUPER_ADMIN_NAME;
    const email = process.env.SUPER_ADMIN_EMAIL;
    const password = process.env.SUPER_ADMIN_PASSWORD;

    if (!name || !email || !password) {
        throw new Error(
            "SUPER_ADMIN_NAME, SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD are required"
        );
    }

    const existingSuperAdmin =
        await prisma.admin.findFirst({
            where: {
                isSuperAdmin: true,
            },
        });

    if (existingSuperAdmin) {
        console.log("Super Admin already exists");
        return;
    }

    const passwordHash =
        await hashPassword(password);

    await prisma.admin.create({
        data: {
            name,
            email,
            passwordHash,
            isSuperAdmin: true,
            isActive: true,
        },
    });

    console.log("Super Admin created successfully");
};

const main = async () => {
    await seedPermissions();
    await seedSuperAdmin();

    console.log("Admin seed completed successfully");
};

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });