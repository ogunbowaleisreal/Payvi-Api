import { prisma } from "../../config/prisma.js";

import {
    TransactionRepository,
} from "../../repository/transaction.repository.js";

import {
    WalletService,
} from "../../services/shared/wallet.service.js";

import type {
    VtpassTransactionUpdateWebhook,
} from "../../interfaces/providers/VTpass/vtpass.webhook.interface.js";

export class VtpassWebhookService {
    private transactionRepository: TransactionRepository;

    constructor() {
        this.transactionRepository =
            new TransactionRepository();
    }

    async handleTransactionUpdate(
        webhook: VtpassTransactionUpdateWebhook
    ): Promise<void> {
        const requestId =
            webhook.data?.requestId;

        if (!requestId) {
            return;
        }

        const transaction =
            await this.transactionRepository
                .findByProviderRequestId(
                    requestId
                );

        if (!transaction) {
            return;
        }

        const providerTransaction =
            webhook.data?.content?.transactions;

        const providerStatus =
            providerTransaction?.status;

        if (!providerStatus) {
            return;
        }

        /*
         * Webhook may be delivered more than once.
         * If Payvi has already reached a final state,
         * there is nothing left to process.
         */
        if (
            transaction.status === "COMPLETED" ||
            transaction.status === "FAILED" ||
            transaction.status === "REVERSED"
        ) {
            return;
        }

        if (providerStatus === "delivered") {
            await this.handleDelivered(
                transaction.id,
            );

            return;
        }

        if (providerStatus === "failed") {
            await this.handleFailed(
                transaction.id,
                providerTransaction?.transactionId as string
            );

            return;
        }

        if (providerStatus === "reversed") {
            await this.handleReversed(
                transaction.id,
                providerTransaction?.transactionId as string,
            );

            return;
        }

        /*
         * initiated / pending / processing / unknown
         *
         * Keep our transaction PROCESSING.
         */
    }

    private async handleDelivered(
        transactionId: string
    ): Promise<void> {
        await prisma.$transaction(
            async (tx) => {
                const transactionRepository =
                    new TransactionRepository(tx);

                const walletService =
                    new WalletService(tx);

                const transaction =
                    await transactionRepository.findById(
                        transactionId
                    );

                if (!transaction) {
                    return;
                }

                if (
                    transaction.status ===
                    "COMPLETED"
                ) {
                    return;
                }

                await walletService.completeDebit(
                    transaction.reference
                );

                await transactionRepository.updateStatus(
                    transactionId,
                    "COMPLETED"
                );

                await tx.user.update({
                    where: {
                        id: transaction.userId,
                    },
                    data: {
                        totalSpent: {
                            increment:
                                Number(transaction.amount),
                        },
                    },
                });
            }
        );
    }

    private async handleFailed(
        transactionId: string,
        providerReference: string
    ): Promise<void> {
        await prisma.$transaction(
            async (tx) => {
                const transactionRepository =
                    new TransactionRepository(tx);

                const walletService =
                    new WalletService(tx);

                const transaction =
                    await transactionRepository
                        .findById(transactionId);

                if (!transaction) {
                    return;
                }

                if (
                    transaction.status ===
                    "FAILED"
                ) {
                    return;
                }

                await walletService.reverseDebit(
                    transaction.reference,
                    `REFUND-${transaction.reference}`,
                    "Airtime purchase failed",
                    {
                        transactionId,
                        provider: "VTPASS",
                        providerReference,
                    }
                );

                await transactionRepository
                    .updateProviderDetails(
                        transactionId,
                        {
                            providerReference,
                            providerStatus: "failed",
                        }
                    );

                await transactionRepository
                    .updateStatus(
                        transactionId,
                        "FAILED"
                    );
            }
        );
    }

    private async handleReversed(
        transactionId: string,
        providerReference: string
    ): Promise<void> {
        await prisma.$transaction(
            async (tx) => {
                const transactionRepository =
                    new TransactionRepository(tx);

                const walletService =
                    new WalletService(tx);

                const transaction =
                    await transactionRepository.findById(
                        transactionId
                    );

                if (!transaction) {
                    return;
                }

                if (
                    transaction.status ===
                    "REVERSED"
                ) {
                    return;
                }

                await walletService.reverseDebit(
                    transaction.reference,
                    `REFUND-${transaction.reference}`,
                    "VTpass transaction reversal",
                    {
                        transactionId,
                        provider: "VTPASS",
                        providerReference,
                    }
                );

                await transactionRepository.updateProviderDetails(
                    transactionId,
                    {
                        providerReference,
                        providerStatus: "reversed",
                    }
                );

                await transactionRepository.updateStatus(
                    transactionId,
                    "REVERSED"
                );

                await tx.user.update({
                    where: {
                        id: transaction.userId,
                    },
                    data: {
                        totalSpent: {
                            decrement:
                                Number(transaction.amount),
                        },
                    },
                });
            }
        );
    }

}