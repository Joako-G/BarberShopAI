import express from "express";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { createRateLimiter } from "../rate-limit.middleware";

function createTestApp(options?: { skipSuccessfulRequests?: boolean }) {
  const app = express();

  app.use(
    createRateLimiter({
      windowMinutes: 15,
      max: 2,
      message: "Rate limit reached",
      skipSuccessfulRequests: options?.skipSuccessfulRequests,
    })
  );
  app.get("/success", (_req, res) => res.status(200).json({ ok: true }));
  app.get("/failure", (_req, res) => res.status(401).json({ ok: false }));

  return app;
}

describe("rate limiting", () => {
  it("returns a standardized 429 response after the configured limit", async () => {
    const app = createTestApp();

    expect((await request(app).get("/success")).status).toBe(200);
    expect((await request(app).get("/success")).status).toBe(200);

    const limited = await request(app).get("/success");

    expect(limited.status).toBe(429);
    expect(limited.body).toMatchObject({
      success: false,
      error: {
        message: "Rate limit reached",
        statusCode: 429,
      },
    });
    expect(limited.headers).toHaveProperty("ratelimit");
    expect(limited.headers).not.toHaveProperty("x-ratelimit-limit");
  });

  it("does not count successful login-like requests when configured", async () => {
    const app = createTestApp({ skipSuccessfulRequests: true });

    expect((await request(app).get("/success")).status).toBe(200);
    expect((await request(app).get("/success")).status).toBe(200);
    expect((await request(app).get("/failure")).status).toBe(401);
    expect((await request(app).get("/failure")).status).toBe(401);
    expect((await request(app).get("/failure")).status).toBe(429);
  });
});
