import { PrismaClient, Prisma } from "../../generated/prisma/client.js";
import { WalletRepository } from "../../repository/wallet.repository.js";
import { WalletTransactionRepository } from "../../repository/wallet.transaction.repository.js";
import { AppError } from "../../utils/app-error.js";
import { prisma } from "../../config/prisma.js";


type PrismaClientType =
    | PrismaClient
    | Prisma.TransactionClient;

export class WalletService {
    // constructor(private readonly prisma: PrismaClient) { }

    private walletRepository: WalletRepository;
    private walletTransactionRepository: WalletTransactionRepository;

    constructor(
        private readonly prismaClient: PrismaClientType) {
        this.walletRepository =
            new WalletRepository(this.prismaClient);

        this.walletTransactionRepository =
            new WalletTransactionRepository(
                prismaClient
            );
    }

    async getWallet(userId: number) {

        const wallet = await this.walletRepository.findByUserId(userId);

        if (!wallet) {
            throw new AppError("Wallet not found", 404);
        }

        return wallet;
    }

    async createWallet(userId: number) {

        const existingWallet = await this.walletRepository.findByUserId(userId);

        if (existingWallet) {
            return existingWallet;
        }

        return this.walletRepository.create(userId);
    }

    async credit(
        userId: number,
        amount: number,
        reference: string,
        description?: string,
        metadata?: object,
    ) {
        return prisma.$transaction(async (tx) => {
            const walletRepository = new WalletRepository(tx);
            const walletTransactionRepository =
                new WalletTransactionRepository(tx);

            const wallet = await walletRepository.findByUserId(userId);

            if (!wallet) {
                throw new AppError("Wallet not found", 404);
            }

            const existingTransaction =
                await walletTransactionRepository.findByReference(reference);

            if (existingTransaction) {
                return existingTransaction;
            }

            await walletRepository.incrementBalance(wallet.id, amount);

            return walletTransactionRepository.create({
                walletId: wallet.id,
                type: "CREDIT",
                status: "COMPLETED",
                amount,
                reference,
                ...(description !== undefined && {
                    description,
                }),
                ...(metadata !== undefined && {
                    metadata,
                }),
            });
        });
    }


    async debit(
        userId: number,
        amount: number,
        reference: string,
        description?: string,
        metadata?: object
    ) {
        const wallet =
            await this.walletRepository.findByUserId(
                userId
            );

        if (!wallet) {
            throw new AppError(
                "Wallet not found",
                404
            );
        }

        const existingTransaction =
            await this.walletTransactionRepository
                .findByReference(reference);

        if (existingTransaction) {
            return existingTransaction;
        }

        if (
            wallet.balance.lessThan(
                new Prisma.Decimal(amount)
            )
        ) {
            throw new AppError(
                "Insufficient wallet balance",
                400
            );
        }

        await this.walletRepository.decrementBalance(
            wallet.id,
            amount
        );

        return this.walletTransactionRepository.create({
            walletId: wallet.id,
            type: "DEBIT",
            status: "COMPLETED",
            amount,
            reference,
            ...(description !== undefined && {
                description,
            }),
            ...(metadata !== undefined && {
                metadata,
            }),
        });
    }
}