import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/app.js";

// Unlike the utils tests above, this one doesn't call a function directly -
// it sends a real HTTP request through your actual Express app (routes,
// middleware, everything) using supertest, and checks the real response.
// This is called an "integration test" because it tests multiple pieces
// working together, not just one function in isolation.

describe("GET /api/health", () => {
    it("returns 200 with status ok", async () => {
        const response = await request(app).get("/api/health");

        expect(response.status).toBe(200);
        expect(response.body.status).toBe("ok");
    });
});
