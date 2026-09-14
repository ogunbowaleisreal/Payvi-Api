import { describe, it, expect } from "vitest";
import { hashPassword, comparePassword } from "../../src/utils/password.utils.js";

// These functions return Promises (bcrypt is async), so every test
// here uses async/await. That's the only real difference from the
// hashToken tests - the pattern is otherwise identical.

describe("hashPassword", () => {
    it("returns a hash different from the original password", async () => {
        const hash = await hashPassword("MyPassword123!");

        expect(hash).not.toBe("MyPassword123!");
    });

    it("produces a different hash each time (bcrypt salts randomly)", async () => {
        const hash1 = await hashPassword("MyPassword123!");
        const hash2 = await hashPassword("MyPassword123!");

        // Unlike hashToken (sha256), bcrypt includes a random salt,
        // so hashing the SAME password twice gives DIFFERENT output.
        expect(hash1).not.toBe(hash2);
    });
});

describe("comparePassword", () => {
    it("returns true when the password matches its hash", async () => {
        const hash = await hashPassword("MyPassword123!");

        const result = await comparePassword("MyPassword123!", hash);

        expect(result).toBe(true);
    });

    it("returns false when the password does not match", async () => {
        const hash = await hashPassword("MyPassword123!");

        const result = await comparePassword("WrongPassword", hash);

        expect(result).toBe(false);
    });
});
