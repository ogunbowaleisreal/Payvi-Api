import { PrismaClient, Prisma } from "../../generated/prisma/client.js";
import { WalletRepository } from "../../repository/wallet.repository.js";
import { WalletTransactionRepository } from "../../repository/wallet.transaction.repository.js";
import { AppError } from "../../utils/app-error.js";


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
        description: string,
        metadata?: Record<string, unknown>
    ) {
        const wallet =
            await this.walletRepository.findByUserId(userId);

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

        await this.walletRepository.incrementBalance(
            wallet.id,
            amount
        );

        return this.walletTransactionRepository.create({
            walletId: wallet.id,
            type: "CREDIT",
            status: "COMPLETED",
            amount,
            reference,
            description,
            metadata,
        });
    }

    async reserveDebit(
        userId: number,
        amount: number,
        reference: string,
        description: string,
        metadata?: Record<string, unknown>
    ) {
        const wallet =
            await this.walletRepository.findByUserId(userId);

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

        /*
         * Atomically reserve the money.
         *
         * This prevents two concurrent requests
         * from spending the same wallet balance.
         */
        const updatedWallet =
            await this.prismaClient.wallet.updateMany({
                where: {
                    id: wallet.id,
                    balance: {
                        gte: amount,
                    },
                },
                data: {
                    balance: {
                        decrement: amount,
                    },
                },
            });

        if (updatedWallet.count === 0) {
            throw new AppError(
                "Insufficient wallet balance",
                400
            );
        }

        return this.walletTransactionRepository.create({
            walletId: wallet.id,
            type: "DEBIT",
            status: "PENDING",
            amount,
            reference,
            description,
            metadata,
        });
    }

    async completeDebit(
        reference: string
    ) {
        const transaction =
            await this.walletTransactionRepository
                .findByReference(reference);

        if (!transaction) {
            throw new AppError(
                "Wallet transaction not found",
                404
            );
        }

        if (
            transaction.status ===
            "COMPLETED"
        ) {
            return transaction;
        }

        return this.walletTransactionRepository
            .updateStatus(
                transaction.id,
                "COMPLETED"
            );
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


    async reverseDebit(
        reference: string,
        refundReference: string,
        description: string,
        metadata?: Record<string, unknown>
    ) {
        const debitTransaction =
            await this.walletTransactionRepository
                .findByReference(reference);

        if (!debitTransaction) {
            throw new AppError(
                "Wallet transaction not found",
                404
            );
        }

        if (
            debitTransaction.status ===
            "REVERSED"
        ) {
            return debitTransaction;
        }

        const existingRefund =
            await this.walletTransactionRepository
                .findByReference(
                    refundReference
                );

        if (existingRefund) {
            return debitTransaction;
        }

        await this.walletRepository.incrementBalance(
            debitTransaction.walletId,
            Number(debitTransaction.amount)
        );

        await this.walletTransactionRepository.create({
            walletId: debitTransaction.walletId,
            type: "CREDIT",
            status: "COMPLETED",
            amount: Number(debitTransaction.amount),
            reference: refundReference,
            description,
            metadata,
        });

        return this.walletTransactionRepository
            .updateStatus(
                debitTransaction.id,
                "REVERSED"
            );
    }
}