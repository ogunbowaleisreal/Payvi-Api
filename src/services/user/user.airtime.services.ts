import { randomUUID } from "node:crypto";

import { AppError } from "../../utils/app-error.js";
import { prisma } from "../../config/prisma.js";

import { TransactionRepository } from "../../repository/transaction.repository.js";
import { WalletService } from "../../services/shared/wallet.service.js";
import { TransactionPinService } from "../shared/transaction.pin.services.js";
import { VtpassService } from "../../providers/VTpass/vtpass.airtime.provider.js";
import type { PurchaseAirtimeInput } from "../../interfaces/users/user.airtime.interface.js";
import { generateVtpassRequestId } from "../../utils/vtpass.utils.js";


export class AirtimeService {
    private transactionRepository: TransactionRepository;
    // private walletService: WalletService;
    private transactionPinService: TransactionPinService;
    private vtpassService: VtpassService;

    constructor() {
        this.transactionRepository =
            new TransactionRepository();

        // this.walletService =
        //     new WalletService(prisma);

        this.transactionPinService =
            new TransactionPinService();

        this.vtpassService =
            new VtpassService();
    }

    private getVtpassServiceId(
        network: string
    ): string {
        switch (
        network.toUpperCase()
        ) {
            case "MTN":
                return "mtn";

            case "GLO":
                return "glo";

            case "AIRTEL":
                return "airtel";

            case "NINEMOBILE":
                return "etisalat";

            default:
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

        const providerRequestId =
            generateVtpassRequestId();


        /*
         * 3. Resolve VTpass service ID
         */

        const serviceId =
            this.getVtpassServiceId(
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
                            provider: "VTPASS",
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
                            provider:
                                "VTPASS",
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
         * 6. Call VTpass
         */
        let providerResult;
        try {
            providerResult =
                await this.vtpassService.purchaseAirtime({
                    serviceId,
                    phoneNumber:
                        input.phoneNumber,
                    amount:
                        input.amount,
                    requestId:
                        providerRequestId,
                });

        } catch {
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
        await this.transactionRepository
            .updateProviderDetails(
                transaction.id,
                {
                    providerRequestId:
                        providerResult.requestId,

                    providerReference:
                        providerResult.providerReference,

                    providerStatus:
                        providerResult.status,
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

                        await transactionRepository
                            .updateProviderDetails(
                                transaction.id,
                                {
                                    providerRequestId:
                                        providerResult.requestId,
                                    providerReference:
                                        providerResult.providerReference,
                                    providerStatus:
                                        providerResult.status,
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

                    await transactionRepository
                        .updateProviderDetails(
                            transaction.id,
                            {
                                providerRequestId:
                                    providerResult.requestId,
                                providerReference:
                                    providerResult.providerReference,
                                providerStatus:
                                    providerResult.status,
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
}