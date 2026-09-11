import type { User } from "../generated/prisma/client.js";
import { randomBytes } from "node:crypto";
export const toUserResponse = (user: User) => {
    const { passwordHash, ...safeUser } = user;

    return safeUser;
};

export const generateRandomToken = (
    byteLength = 32
): string => {
    return randomBytes(byteLength).toString("hex");
};