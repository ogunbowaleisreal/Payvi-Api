import type { Gender } from "../../generated/prisma/client.js";
export interface CreateUserData {
    name: string;
    email: string;
    passwordHash: string
}

export interface CreateUserInput {
    name: string;
    email: string;
    password: string;
}

export interface LoginUserInput {
    email: string;
    password: string;
}

export interface UpdateProfileInput {
    name?: string;
    phone?: string | null;
    gender?: Gender | null;
    avatar?: string | null;
}
