import {
    PrismaClient,
    Prisma,
} from "../generated/prisma/client.js";

import type {
    WalletTransactionStatus,
} from "../generated/prisma/client.js";

import type {
    CreateWalletTransactionInput,
} from "../interfaces/wallet.interfaces.js";


type PrismaClientType =
    | PrismaClient
    | Prisma.TransactionClient;


export class WalletTransactionRepository {

    constructor(
        private readonly prisma: PrismaClientType
    ) { }


    async create(
        data: CreateWalletTransactionInput
    ) {
        return this.prisma.walletTransaction.create({
            data: {
                walletId: data.walletId,
                type: data.type,
                status: data.status,
                amount: data.amount,
                reference: data.reference,

                ...(data.description !== undefined && {
                    description: data.description,
                }),

                ...(data.metadata !== undefined && {
                    metadata: data.metadata,
                }),
            },
        });
    }


    async findByReference(
        reference: string
    ) {
        return this.prisma.walletTransaction.findUnique({
            where: {
                reference,
            },
        });
    }


    async findById(
        id: string
    ) {
        return this.prisma.walletTransaction.findUnique({
            where: {
                id,
            },
        });
    }


    async findByWalletId(
        walletId: string
    ) {
        return this.prisma.walletTransaction.findMany({
            where: {
                walletId,
            },

            orderBy: {
                createdAt: "desc",
            },
        });
    }


    async updateStatus(
        id: string,
        status: WalletTransactionStatus
    ) {
        return this.prisma.walletTransaction.update({
            where: {
                id,
            },

            data: {
                status,
            },
        });
    }
}