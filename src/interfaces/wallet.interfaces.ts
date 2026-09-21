import type {
    WalletTransactionStatus,
    WalletTransactionType,
} from "../generated/prisma/client.js";


export interface CreateWalletTransactionInput {
    walletId: string;
    type: WalletTransactionType;
    amount: number;
    reference: string;
    status: WalletTransactionStatus;
    description?: string;
    metadata?: any;
}