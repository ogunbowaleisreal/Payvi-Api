import { prisma } from "../config/prisma.js";
import {
    PrismaClient,
    Prisma,
} from "../generated/prisma/client.js";
import type {
    TransactionStatus,
} from "../generated/prisma/client.js";

type PrismaClientType =
    | PrismaClient
    | Prisma.TransactionClient;

export class TransactionRepository {
    private prisma: PrismaClientType;

    constructor(prismaClient?: PrismaClientType) {
        this.prisma =
            prismaClient ?? prisma;
    }

    async create(data: Prisma.TransactionCreateInput) {
        return this.prisma.transaction.create({
            data,
        });
    }

    async findById(id: string) {
        return this.prisma.transaction.findUnique({
            where: {
                id,
            },
        });
    }

    async findByReference(reference: string) {
        return this.prisma.transaction.findUnique({
            where: {
                reference,
            },
        });
    }

    async updateProviderDetails(
        id: string,
        data: {
            providerRequestId?: string;
            providerReference?: string;
            providerStatus?: string;
        }
    ) {
        return this.prisma.transaction.update({
            where: { id },

            data: {
                ...(data.providerRequestId !== undefined && {
                    providerRequestId:
                        data.providerRequestId,
                }),

                ...(data.providerReference !== undefined && {
                    providerReference:
                        data.providerReference,
                }),

                ...(data.providerStatus !== undefined && {
                    providerStatus:
                        data.providerStatus,
                }),
            },
        });
    }

    async updateStatus(
        id: string,
        status: TransactionStatus
    ) {
        return this.prisma.transaction.update({
            where: {
                id,
            },
            data: {
                status,
            },
        });
    }
}