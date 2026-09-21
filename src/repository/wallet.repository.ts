import { PrismaClient, Prisma } from "../generated/prisma/client.js";

type PrismaClientType = PrismaClient | Prisma.TransactionClient;

export class WalletRepository {
    constructor(private readonly prisma: PrismaClientType) { }

    async findByUserId(userId: number) {
        return this.prisma.wallet.findUnique({
            where: {
                userId,
            },
        });
    }

    async findById(walletId: string) {
        return this.prisma.wallet.findUnique({
            where: {
                id: walletId,
            },
        });
    }

    async create(userId: number) {
        return this.prisma.wallet.create({
            data: {
                userId,
            },
        });
    }

    async updateTransactionPin(
        walletId: string,
        pinHash: string
    ) {
        return this.prisma.wallet.update({
            where: {
                id: walletId,
            },
            data: {
                transactionPinHash: pinHash,
            },
        });
    }

    async incrementBalance(walletId: string, amount: number) {
        return this.prisma.wallet.update({
            where: {
                id: walletId,
            },
            data: {
                balance: {
                    increment: amount,
                },
            },
        });
    }

    async decrementBalance(walletId: string, amount: number) {
        return this.prisma.wallet.update({
            where: {
                id: walletId,
            },
            data: {
                balance: {
                    decrement: amount,
                },
            },
        });
    }
}