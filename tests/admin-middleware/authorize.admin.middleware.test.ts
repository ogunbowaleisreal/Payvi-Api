import { describe, expect, it, vi } from "vitest";
import request from "supertest";


vi.mock("../../src/repository/admin.repository.ts", () => {
    return {
        AdminRepository: vi.fn().mockImplementation(function () {
            return {
                findAdminById: vi.fn().mockResolvedValue(null),

            };
        }),
    };
})