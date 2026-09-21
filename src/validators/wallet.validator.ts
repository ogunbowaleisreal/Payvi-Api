import { z } from "zod";

export const setTransactionPinSchema = z.object({
    body: z.object({
        pin: z
            .string()
            .regex(
                /^\d{6}$/,
                "Transaction PIN must be exactly 6 digits"
            ),
    }),
});

export const changeTransactionPinSchema = z.object({
    body: z.object({
        currentPin: z
            .string()
            .regex(
                /^\d{6}$/,
                "Current Transaction PIN must be exactly 6 digits"
            ),

        newPin: z
            .string()
            .regex(
                /^\d{6}$/,
                "New Transaction PIN must be exactly 6 digits"
            ),
    }),
});