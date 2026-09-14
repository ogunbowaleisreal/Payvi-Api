import { describe, it, expect } from "vitest";
import { hashToken } from "../../src/utils/hash.utils.js";

// hashToken is a "pure" function: same input always gives the same
// output, and it doesn't touch a database, network, or the filesystem.
// That makes it the easiest possible thing to test - no setup required.

describe("hashToken", () => {
    it("produces the same hash for the same input", () => {
        const hash1 = hashToken("my-refresh-token");
        const hash2 = hashToken("my-refresh-token");

        expect(hash1).toBe(hash2);
    });

    it("produces different hashes for different input", () => {
        const hash1 = hashToken("token-a");
        const hash2 = hashToken("token-b");

        expect(hash1).not.toBe(hash2);
    });

    it("returns a 64-character hex string (sha256)", () => {
        const hash = hashToken("anything");

        expect(hash).toHaveLength(64);
        expect(hash).toMatch(/^[0-9a-f]+$/);
    });
});
