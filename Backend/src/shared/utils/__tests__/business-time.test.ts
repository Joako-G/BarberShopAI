import { describe, expect, it } from "vitest";
import {
  getBusinessDateTimeParts,
  getCalendarDayOfWeek,
  isBusinessDateTimePastOrNow,
  isValidCalendarDate,
} from "../business-time";

describe("business time", () => {
  it("uses Buenos Aires even when UTC is already on the next day", () => {
    const parts = getBusinessDateTimeParts(
      new Date("2026-06-25T01:30:00.000Z")
    );

    expect(parts).toMatchObject({
      date: "2026-06-24",
      time: "22:30",
      year: 2026,
      month: 6,
      day: 24,
      hour: 22,
      minute: 30,
    });
  });

  it("compares appointments against the business clock", () => {
    const now = new Date("2026-06-25T13:00:00.000Z");

    expect(isBusinessDateTimePastOrNow("2026-06-25", "09:59", now)).toBe(true);
    expect(isBusinessDateTimePastOrNow("2026-06-25", "10:00", now)).toBe(true);
    expect(isBusinessDateTimePastOrNow("2026-06-25", "10:01", now)).toBe(false);
  });

  it("validates calendar dates and weekdays independently from server timezone", () => {
    expect(isValidCalendarDate("2026-02-29")).toBe(false);
    expect(isValidCalendarDate("2028-02-29")).toBe(true);
    expect(getCalendarDayOfWeek("2026-06-28")).toBe(0);
    expect(getCalendarDayOfWeek("2026-06-29")).toBe(1);
  });
});
