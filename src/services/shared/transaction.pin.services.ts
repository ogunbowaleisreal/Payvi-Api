import { WalletRepository } from "../../repository/wallet.repository.js";
import { AppError } from "../../utils/app-error.js";
import { hashPassword, comparePassword } from "../../utils/password.utils.js";
import { prisma } from "../../config/prisma.js";

export class TransactionPinService {
    private walletRepository: WalletRepository;

    constructor() {
        this.walletRepository = new WalletRepository(prisma);
    }
    async setPin(
        userId: number,
        pin: string
    ) {

        const wallet =
            await this.walletRepository.findByUserId(userId);

        if (!wallet) {
            throw new AppError(
                "Wallet not found",
                404
            );
        }

        if (wallet.transactionPinHash) {
            throw new AppError(
                "Transaction PIN already exists",
                400
            );
        }

        const pinHash =
            await hashPassword(pin);

        await this.walletRepository.updateTransactionPin(
            wallet.id,
            pinHash
        );
    }

    async verifyPin(
        userId: number,
        pin: string
    ): Promise<void> {
        const wallet =
            await this.walletRepository.findByUserId(userId);

        if (!wallet) {
            throw new AppError(
                "Wallet not found",
                404
            );
        }

        if (!wallet.transactionPinHash) {
            throw new AppError(
                "Transaction PIN has not been set",
                400
            );
        }

        const isValid =
            await comparePassword(
                pin,
                wallet.transactionPinHash
            );

        if (!isValid) {
            throw new AppError(
                "Invalid Transaction PIN",
                400
            );
        }
    }

    async changePin(
        userId: number,
        currentPin: string,
        newPin: string
    ): Promise<void> {
        const wallet =
            await this.walletRepository.findByUserId(userId);

        if (!wallet) {
            throw new AppError(
                "Wallet not found",
                404
            );
        }

        if (!wallet.transactionPinHash) {
            throw new AppError(
                "Transaction PIN has not been set",
                400
            );
        }

        const isCurrentPinValid =
            await comparePassword(
                currentPin,
                wallet.transactionPinHash
            );

        if (!isCurrentPinValid) {
            throw new AppError(
                "Invalid current Transaction PIN",
                400
            );
        }

        const newPinHash =
            await hashPassword(newPin);

        await this.walletRepository.updateTransactionPin(
            wallet.id,
            newPinHash
        );
    }
}