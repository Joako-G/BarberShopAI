import cors from "cors";
import express from "express";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { createCorsOptions, isOriginAllowed } from "../../config/cors";
import { errorHandler } from "../error-handler";

const development = {
  NODE_ENV: "development" as const,
  ALLOWED_ORIGINS: "",
};

describe("CORS configuration", () => {
  it.each([
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5173",
  ])("allows local origin %s during development", (origin) => {
    expect(isOriginAllowed(origin, development)).toBe(true);
  });

  it("allows requests without Origin", () => {
    expect(isOriginAllowed(undefined, development)).toBe(true);
  });

  it("rejects external origins during development unless explicitly listed", () => {
    expect(isOriginAllowed("https://example.com", development)).toBe(false);
    expect(
      isOriginAllowed("https://example.com", {
        ...development,
        ALLOWED_ORIGINS: "https://example.com",
      })
    ).toBe(true);
  });

  it("allows only configured origins in production", () => {
    const production = {
      NODE_ENV: "production" as const,
      ALLOWED_ORIGINS:
        "https://barbershop.vercel.app, https://www.barbershop.com",
    };

    expect(
      isOriginAllowed("https://barbershop.vercel.app", production)
    ).toBe(true);
    expect(isOriginAllowed("http://localhost:5173", production)).toBe(false);
    expect(
      isOriginAllowed("https://random-preview.vercel.app", production)
    ).toBe(false);
  });

  it("returns 403 through the API error format for a rejected origin", async () => {
    const app = express();

    app.use(cors(createCorsOptions(development)));
    app.get("/resource", (_req, res) => res.json({ ok: true }));
    app.use(errorHandler);

    const response = await request(app)
      .get("/resource")
      .set("Origin", "https://blocked.example");

    expect(response.status).toBe(403);
    expect(response.body).toMatchObject({
      success: false,
      error: {
        message: "Origin not allowed by CORS",
        statusCode: 403,
      },
    });
  });
});
