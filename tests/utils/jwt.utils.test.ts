import { describe, it, expect } from "vitest";
import {
    generateAccessToken,
    verifyAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
} from "../../src/utils/jwt.utils.js";

describe("access tokens", () => {
    it("can be verified after being generated (round trip)", () => {
        const token = generateAccessToken(42);

        const payload = verifyAccessToken(token);

        expect(payload.userId).toBe(42);
    });

    it("throws when the token has been tampered with", () => {
        const token = generateAccessToken(42);
        const tampered = token.slice(0, -1) + (token.endsWith("a") ? "b" : "a");

        // We expect calling this to THROW, not return a value.
        // Vitest needs the call wrapped in an arrow function so it can
        // catch the throw itself - expect(verifyAccessToken(tampered))
        // would throw before expect() ever runs.
        expect(() => verifyAccessToken(tampered)).toThrow();
    });

    it("throws for a completely invalid token string", () => {
        expect(() => verifyAccessToken("not-a-real-token")).toThrow();
    });
});

describe("refresh tokens", () => {
    it("round trip includes both userId and sessionId", () => {
        const token = generateRefreshToken(7, "session-abc");

        const payload = verifyRefreshToken(token);

        expect(payload.userId).toBe(7);
        expect(payload.sessionId).toBe("session-abc");
    });

    it("access token secret and refresh token secret are independent", () => {
        // An access token should NOT verify successfully as a refresh token,
        // since they're signed with different secrets.
        const accessToken = generateAccessToken(1);

        expect(() => verifyRefreshToken(accessToken)).toThrow();
    });
});
