import { randomUUID } from "node:crypto";

import { AppError } from "../../utils/app-error.js";
import { prisma } from "../../config/prisma.js";

import { TransactionRepository } from "../../repository/transaction.repository.js";
import { WalletService } from "../../services/shared/wallet.service.js";
import { TransactionPinService } from "../shared/transaction.pin.services.js";
// import { VtpassService } from "../../providers/VTpass/vtpass.airtime.provider.js";
import type { PurchaseAirtimeInput } from "../../interfaces/users/user.airtime.interface.js";
import {
    ClubkonnectService,
} from "../../providers/ClubKonnect/clubkonnect.service.js";
// import { generateVtpassRequestId } from "../../utils/vtpass.utils.js";


export class AirtimeService {
    private transactionRepository: TransactionRepository;
    // private walletService: WalletService;
    private transactionPinService: TransactionPinService;
    private clubkonnectService: ClubkonnectService;

    constructor() {
        this.transactionRepository =
            new TransactionRepository();

        // this.walletService =
        //     new WalletService(prisma);

        this.transactionPinService =
            new TransactionPinService();

        // this.vtpassService =
        //     new VtpassService();

        this.clubkonnectService =
            new ClubkonnectService();
    }

    private validateNetwork(
        network: string
    ): void {

        const supportedNetworks = [
            "MTN",
            "GLO",
            "AIRTEL",
            "NINEMOBILE",
            "T2MOBILE",
        ];

        if (
            !supportedNetworks.includes(
                network.toUpperCase()
            )
        ) {
            throw new AppError(
                "Unsupported network",
                400
            );
        }
    }




    async purchaseAirtime(
        userId: number,
        input: PurchaseAirtimeInput
    ) {

        /*
         * 1. Verify Transaction PIN
         */

        await this.transactionPinService.verifyPin(
            userId,
            input.transactionPin
        );

        /*
         * 2. Generate references
         */

        const reference =
            `PAY-${randomUUID()}`;

        // const providerRequestId =
        //generateVtpassRequestId();
        const providerRequestId = `PAYVI-${randomUUID()}`;


        /*
         * 3. Resolve VTpass service ID
         */

        // const serviceId =
        //     this.getVtpassServiceId(
        //         input.network
        //     );

        this.validateNetwork(
            input.network
        );


        /*
         * 4. Create Payvi transaction
         */
        const transaction =
            await prisma.$transaction(
                async (tx) => {
                    const transactionRepository =
                        new TransactionRepository(tx);

                    const walletService =
                        new WalletService(tx);

                    const transaction =
                        await transactionRepository.create({
                            user: {
                                connect: {
                                    id: userId,
                                },
                            },
                            type: "AIRTIME",
                            status: "PENDING",
                            amount: input.amount,
                            reference,
                            provider: "CLUBKONNECT",
                            //provider: "VTPASS",
                            providerRequestId,
                            phoneNumber:
                                input.phoneNumber,
                        });

                    await walletService.reserveDebit(
                        userId,
                        input.amount,
                        reference,
                        "Airtime purchase",
                        {
                            transactionId:
                                transaction.id,
                            // provider:
                            //     "VTPASS",
                            provider: "CLUBKONNECT",
                            phoneNumber:
                                input.phoneNumber,
                            network:
                                input.network,
                        }
                    );

                    await transactionRepository
                        .updateStatus(
                            transaction.id,
                            "PROCESSING"
                        );

                    return transaction;
                }
            );


        /*
         * 5. Mark transaction as processing
         */

        await this.transactionRepository.updateStatus(
            transaction.id,
            "PROCESSING"
        );


        /*
 * 6. Call Clubkonnect
 */

        let providerResult;

        try {
            providerResult =
                await this.clubkonnectService.purchaseAirtime({
                    network:
                        input.network,

                    phoneNumber:
                        input.phoneNumber,

                    amount:
                        input.amount,

                    requestId:
                        providerRequestId,
                });

        } catch (error) {

            console.error(
                "Clubkonnect airtime request failed:",
                error
            );

            /*
             * A network error or timeout does not prove
             * that the provider failed to process the order.
             *
             * Keep the reserved debit and resolve the
             * transaction using the query endpoint.
             */

            return {
                transactionId:
                    transaction.id,

                reference,

                status: "PROCESSING",

                amount:
                    input.amount,

                phoneNumber:
                    input.phoneNumber,

                network:
                    input.network,
            };
        }
        /*
         * 7. Save provider response
         */
        await this.transactionRepository.updateProviderDetails(
            transaction.id,
            {
                providerRequestId: providerResult.requestId,
                ...(providerResult.providerReference !== undefined && {
                    providerReference: providerResult.providerReference,
                }),
                providerStatus: providerResult.status,
            }
        );
        /*
         * 8. Provider delivered successfully
         */

        if (providerResult.success) {
            if (providerResult.success) {
                await prisma.$transaction(
                    async (tx) => {
                        const walletService =
                            new WalletService(tx);

                        const transactionRepository =
                            new TransactionRepository(tx);

                        await walletService.completeDebit(
                            reference
                        );

                        await this.transactionRepository.updateProviderDetails(
                            transaction.id,
                            {
                                providerRequestId: providerResult.requestId,
                                ...(providerResult.providerReference !== undefined && {
                                    providerReference: providerResult.providerReference,
                                }),
                                providerStatus: providerResult.status,
                            }
                        );

                        await transactionRepository
                            .updateStatus(
                                transaction.id,
                                "COMPLETED"
                            );

                        await tx.user.update({
                            where: {
                                id: userId,
                            },
                            data: {
                                totalSpent: {
                                    increment:
                                        input.amount,
                                },
                            },
                        });
                    }
                );

                return {
                    transactionId:
                        transaction.id,
                    reference,
                    status: "COMPLETED",
                    amount: input.amount,
                    phoneNumber:
                        input.phoneNumber,
                    network:
                        input.network,
                    providerReference:
                        providerResult
                            .providerReference,
                };
            }


        }


        /*
         * 9. Definitive provider failure
         */
        if (
            providerResult.status ===
            "failed"
        ) {
            await prisma.$transaction(
                async (tx) => {
                    const walletService =
                        new WalletService(tx);

                    const transactionRepository =
                        new TransactionRepository(tx);

                    await walletService.reverseDebit(
                        reference,
                        `REFUND-${reference}`,
                        "Airtime purchase failed",
                        {
                            transactionId:
                                transaction.id,
                            provider:
                                "VTPASS",
                            providerReference:
                                providerResult.providerReference,
                        }
                    );
                    await this.transactionRepository.updateProviderDetails(
                        transaction.id,
                        {
                            providerRequestId: providerResult.requestId,
                            ...(providerResult.providerReference !== undefined && {
                                providerReference: providerResult.providerReference,
                            }),
                            providerStatus: providerResult.status,
                        }
                    );

                    await transactionRepository
                        .updateStatus(
                            transaction.id,
                            "FAILED"
                        );
                }
            );

            throw new AppError(
                providerResult.message ??
                "Airtime purchase failed",
                400
            );
        }


        /*
         * 10. Provider hasn't given us
         * a definitive result yet.
         */

        return {

            transactionId:
                transaction.id,

            reference,

            status: "PROCESSING",

            amount:
                input.amount,

            phoneNumber:
                input.phoneNumber,

            network:
                input.network,
        };
    }



    async requeryAirtimeTransaction(
        transactionId: string
    ) {
        const transaction =
            await this.transactionRepository.findById(
                transactionId
            );

        if (!transaction) {
            throw new AppError(
                "Transaction not found",
                404
            );
        }

        if (!transaction.providerRequestId) {
            throw new AppError(
                "Provider request ID not found",
                400
            );
        }

        if (
            transaction.status === "COMPLETED" ||
            transaction.status === "FAILED" ||
            transaction.status === "REVERSED"
        ) {
            return {
                transactionId: transaction.id,
                reference: transaction.reference,
                status: transaction.status,
            };
        }

        let providerResult;

        try {
            providerResult =
                await this.clubkonnectService
                    .requeryTransaction(
                        transaction.providerRequestId
                    );
        } catch {
            return {
                transactionId: transaction.id,
                reference: transaction.reference,
                status: "PROCESSING",
            };
        }

        await this.transactionRepository.updateProviderDetails(
            transaction.id,
            {
                providerRequestId: providerResult.requestId,
                ...(providerResult.providerReference !== undefined && {
                    providerReference: providerResult.providerReference,
                }),
                providerStatus: providerResult.status,
            }
        );

        if (
            providerResult.status ===
            "delivered"
        ) {
            await prisma.$transaction(
                async (tx) => {
                    const transactionRepository =
                        new TransactionRepository(tx);

                    const walletService =
                        new WalletService(tx);

                    const currentTransaction =
                        await transactionRepository
                            .findById(transaction.id);

                    if (!currentTransaction) {
                        return;
                    }

                    if (
                        currentTransaction.status ===
                        "COMPLETED"
                    ) {
                        return;
                    }

                    await walletService.completeDebit(
                        currentTransaction.reference
                    );

                    await transactionRepository
                        .updateStatus(
                            currentTransaction.id,
                            "COMPLETED"
                        );

                    await tx.user.update({
                        where: {
                            id: currentTransaction.userId,
                        },
                        data: {
                            totalSpent: {
                                increment:
                                    Number(
                                        currentTransaction
                                            .amount
                                    ),
                            },
                        },
                    });
                }
            );

            return {
                transactionId: transaction.id,
                reference: transaction.reference,
                status: "COMPLETED",
                providerReference:
                    providerResult.providerReference,
            };
        }

        if (
            providerResult.status ===
            "failed"
        ) {
            await prisma.$transaction(
                async (tx) => {
                    const transactionRepository =
                        new TransactionRepository(tx);

                    const walletService =
                        new WalletService(tx);

                    const currentTransaction =
                        await transactionRepository
                            .findById(transaction.id);

                    if (!currentTransaction) {
                        return;
                    }

                    if (
                        currentTransaction.status ===
                        "FAILED"
                    ) {
                        return;
                    }

                    await walletService.reverseDebit(
                        currentTransaction.reference,
                        `REFUND-${currentTransaction.reference}`,
                        "Airtime purchase failed",
                        {
                            transactionId: currentTransaction.id,
                            provider: "CLUBKONNECT",
                            ...(providerResult.providerReference !== undefined && {
                                providerReference: providerResult.providerReference,
                            }),
                        }
                    );

                    await transactionRepository
                        .updateStatus(
                            currentTransaction.id,
                            "FAILED"
                        );
                }
            );

            return {
                transactionId: transaction.id,
                reference: transaction.reference,
                status: "FAILED",
            };
        }

        // if (
        //     providerResult.status ===
        //     "reversed"
        // ) {
        //     await prisma.$transaction(
        //         async (tx) => {
        //             const transactionRepository =
        //                 new TransactionRepository(tx);

        //             const walletService =
        //                 new WalletService(tx);

        //             const currentTransaction =
        //                 await transactionRepository
        //                     .findById(transaction.id);

        //             if (!currentTransaction) {
        //                 return;
        //             }

        //             if (
        //                 currentTransaction.status ===
        //                 "REVERSED"
        //             ) {
        //                 return;
        //             }

        //             await walletService.reverseDebit(
        //                 currentTransaction.reference,
        //                 `REFUND-${currentTransaction.reference}`,
        //                 "VTpass transaction reversal",
        //                 {
        //                     transactionId:
        //                         currentTransaction.id,
        //                     provider: "VTPASS",
        //                     providerReference:
        //                         providerResult.providerReference,
        //                 }
        //             );

        //             await transactionRepository
        //                 .updateStatus(
        //                     currentTransaction.id,
        //                     "REVERSED"
        //                 );

        //             await tx.user.update({
        //                 where: {
        //                     id: currentTransaction.userId,
        //                 },
        //                 data: {
        //                     totalSpent: {
        //                         decrement:
        //                             Number(
        //                                 currentTransaction
        //                                     .amount
        //                             ),
        //                     },
        //                 },
        //             });
        //         }
        //     );

        //     return {
        //         transactionId: transaction.id,
        //         reference: transaction.reference,
        //         status: "REVERSED",
        //     };
        // }

        return {
            transactionId: transaction.id,
            reference: transaction.reference,
            status: "PROCESSING",
        };
    }


}