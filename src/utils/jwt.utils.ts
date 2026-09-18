import jwt from "jsonwebtoken";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET!;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET!;
const ADMIN_ACCESS_TOKEN_SECRET = process.env.ADMIN_ACCESS_TOKEN_SECRET!;
const ADMIN_REFRESH_TOKEN_SECRET = process.env.ADMIN_REFRESH_TOKEN_SECRET!;

export interface AccessTokenPayload {
    userId: number;
}

export interface RefreshTokenPayload {
    userId: number;
    sessionId: string;
}


export interface AdminRefreshTokenPayload {
    adminId: number;
    sessionId: string;
}
export interface AdminAccessTokenPayload {
    adminId: number;
}

export const generateAdminAccessToken = (
    adminId: number
): string => {
    return jwt.sign(
        { adminId },
        ADMIN_ACCESS_TOKEN_SECRET,
        {
            expiresIn: "3d",
        }
    );
};

export const generateAdminRefreshToken = (
    adminId: number,
    sessionId: string
): string => {
    return jwt.sign(
        {
            adminId,
            sessionId,
        },
        ADMIN_REFRESH_TOKEN_SECRET,
        {
            expiresIn: "7d",
        }
    );
};

export const verifyAdminRefreshToken = (
    token: string
): AdminRefreshTokenPayload => {
    return jwt.verify(
        token,
        ADMIN_REFRESH_TOKEN_SECRET
    ) as AdminRefreshTokenPayload;
};

export const verifyAdminAccessToken = (
    token: string
): AdminAccessTokenPayload => {
    return jwt.verify(
        token,
        ADMIN_ACCESS_TOKEN_SECRET
    ) as AdminAccessTokenPayload;
};


export const generateAccessToken = (userId: number): string => {
    return jwt.sign(
        { userId },
        ACCESS_TOKEN_SECRET,
        {
            expiresIn: "15m",
        }
    );
};

export const generateRefreshToken = (
    userId: number,
    sessionId: string
): string => {
    return jwt.sign(
        { userId, sessionId },
        REFRESH_TOKEN_SECRET,
        {
            expiresIn: "7d",
        }
    );
};

export const verifyAccessToken = (
    token: string
): AccessTokenPayload => {
    return jwt.verify(
        token,
        ACCESS_TOKEN_SECRET
    ) as AccessTokenPayload;
};

export const verifyRefreshToken = (
    token: string
): RefreshTokenPayload => {
    return jwt.verify(
        token,
        REFRESH_TOKEN_SECRET
    ) as RefreshTokenPayload;
};

export interface TwoFactorTokenPayload {
    userId: number;
}

export const generateTwoFactorToken = (
    userId: number
): string => {
    return jwt.sign(
        { userId },
        ACCESS_TOKEN_SECRET,
        {
            expiresIn: "10m",
        }
    );
};

export const verifyTwoFactorToken = (
    token: string
): TwoFactorTokenPayload => {
    return jwt.verify(
        token,
        ACCESS_TOKEN_SECRET
    ) as TwoFactorTokenPayload;
};
