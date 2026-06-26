import { describe, expect, it } from "vitest";
import { getBusinessDate } from "../businessTime";

describe("frontend business date", () => {
    it("uses Buenos Aires instead of the browser or UTC date", () => {
        expect(
            getBusinessDate(
                new Date("2026-06-25T01:30:00.000Z"),
                "America/Argentina/Buenos_Aires"
            )
        ).toBe("2026-06-24");
    });
});
