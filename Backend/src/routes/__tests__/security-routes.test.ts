import request from "supertest";
import { describe, expect, it } from "vitest";
import app from "../../app";

describe("private route security", () => {
  it.each([
    ["get", "/api/services/admin"],
    ["get", "/api/customers"],
    ["get", "/api/appointments"],
    ["get", "/api/profiles"],
    ["get", "/api/profiles/00000000-0000-4000-8000-000000000001"],
    ["get", "/api/settings/general"],
    ["put", "/api/settings/general"],
    ["post", "/api/appointments"],
  ] as const)("rejects unauthenticated %s %s", async (method, path) => {
    const response = await request(app)[method](path);

    expect(response.status).toBe(401);
  });
});
