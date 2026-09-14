import { describe, it, expect, vi } from "vitest";
import request from "supertest";

// --- MOCKS -----------------------------------------------------------
// vi.mock() replaces a whole module with a fake version. Vitest hoists
// these calls to the top of the file automatically, so it doesn't
// matter that the real `import app` statement appears below them -
// by the time app.ts (and everything it imports) actually loads,
// these fakes are already in place.
//
// Why mock these three specifically? Because UserService's constructor
// creates a UserRepository (touches Postgres via Prisma), an OtpService
// (touches Redis), and an EmailService (touches the real Resend API).
// We don't have a database or Redis in this test run, and we definitely
// don't want to send a real email - so we replace each with a fake
// object that returns predictable values instead.

vi.mock("../../src/repository/user.repository.js", () => {
    return {
        UserRepository: vi.fn().mockImplementation(function () {
            return {
                createUser: vi.fn().mockResolvedValue({
                    id: 1,
                    name: "Jane Doe",
                    email: "jane@example.com",
                    passwordHash: "irrelevant-hash",
                    isVerified: false,
                    twoFactorEnabled: false,
                    createdAt: new Date("2026-01-01"),
                }),
                findUserByEmail: vi.fn().mockResolvedValue(null),
            };
        }),
    };
});

vi.mock("../../src/services/shared/otp.service.js", () => {
    return {
        OtpService: vi.fn().mockImplementation(function () {
            return {
                generateOtp: vi.fn().mockResolvedValue("123456"),
            };
        }),
    };
});

vi.mock("../../src/services/shared/email.service.js", () => {
    return {
        EmailService: vi.fn().mockImplementation(function () {
            return {
                sendEmail: vi.fn().mockResolvedValue(undefined),
            };
        }),
    };
});

// Imported AFTER the mocks are declared (though hoisting means the
// order wouldn't actually break this) so the intent reads top-to-bottom:
// set up fakes, THEN load the real app that will use them.
import app from "../../src/app.js";

describe("POST /api/user/auth/register", () => {
    it("creates a user and returns 201 with the safe user object", async () => {
        const response = await request(app)
            .post("/api/user/auth/register")
            .send({
                name: "Jane Doe",
                email: "jane@example.com",
                password: "StrongPassword123!",
            });

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.data.email).toBe("jane@example.com");

        // toUserResponse() strips passwordHash before sending it back -
        // this test also guards against that accidentally regressing.
        expect(response.body.data.passwordHash).toBeUndefined();
    });

    it("returns 400 when the password is too short", async () => {
        const response = await request(app)
            .post("/api/user/auth/register")
            .send({
                name: "Jane Doe",
                email: "jane2@example.com",
                password: "short",
            });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
    });

    it("returns 400 when the email is missing", async () => {
        const response = await request(app)
            .post("/api/user/auth/register")
            .send({
                name: "Jane Doe",
                password: "StrongPassword123!",
            });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
    });
});
