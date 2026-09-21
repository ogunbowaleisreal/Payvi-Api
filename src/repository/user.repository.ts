import { prisma } from "../config/prisma.js";
import type { CreateUserData } from "../interfaces/users/user.interface.js";
import type { Gender } from "../generated/prisma/client.js";
import { PrismaClient, Prisma } from "../generated/prisma/client.js";

type PrismaClientType = PrismaClient | Prisma.TransactionClient;


export class UserRepository {

    private prisma: PrismaClientType;

    constructor(prismaClient?: PrismaClientType) {
        this.prisma = prismaClient ?? prisma;
    }
    async createUser(payload: CreateUserData) {
        return this.prisma.user.create({
            data: {
                firstName: payload.firstName,
                lastName: payload.lastName,
                email: payload.email,
                passwordHash: payload.passwordHash,
            },
        });
    }

    async findUserById(id: number) {
        return this.prisma.user.findUnique({
            where: {
                id,
            },
        });
    }

    async findUserByEmail(email: string) {
        return this.prisma.user.findUnique({
            where: {
                email,
            },
        });
    }

    async updateLastLogin(id: number) {
        return this.prisma.user.update({
            where: {
                id,
            },
            data: {
                lastLoginAt: new Date(),
            },
        });
    }

    async updateVerificationStatus(id: number, isVerified: boolean) {
        return this.prisma.user.update({
            where: {
                id,
            },
            data: {
                isVerified,
            },
        });
    }

    async verifyUser(userId: number) {
        return this.prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                isVerified: true,
            },
        });
    }

    async updatePasswordHash(
        userId: number,
        passwordHash: string
    ) {
        return this.prisma.user.update({
            where: { id: userId },
            data: {
                passwordHash,
            },
        });
    }

    async updatePassword(id: number, passwordHash: string) {
        return this.prisma.user.update({
            where: {
                id,
            },
            data: {
                passwordHash,
            },
        });
    }

    async updateProfile(
        userId: number,
        data: {
            name?: string;
            phone?: string | null;
            gender?: Gender | null;
            avatar?: string | null;
        }
    ) {
        return this.prisma.user.update({
            where: {
                id: userId,
            },
            data,
        });
    }

    async updateTwoFactorStatus(
        userId: number,
        enabled: boolean
    ) {
        return this.prisma.user.update({
            where: { id: userId },
            data: {
                twoFactorEnabled: enabled,
            },
        });
    }

    async deactivateUser(id: number) {
        return this.prisma.user.update({
            where: {
                id,
            },
            data: {
                isActive: false,
            },
        });
    }
}