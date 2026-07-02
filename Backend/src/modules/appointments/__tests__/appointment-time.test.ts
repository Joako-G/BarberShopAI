import { describe, expect, it } from "vitest";
import { ValidationError } from "../../../shared/errors";
import {
  assertWithinWorkingHours,
  formatMinutesAsTime,
  getServiceTotalMinutes,
  isWorkingDay,
  parseTimeToMinutes,
} from "../use-cases/appointment-time.utils";

describe("appointment time rules", () => {
  it("calculates duration plus buffer", () => {
    expect(
      getServiceTotalMinutes(
        {
          duration_minutes: 45,
          buffer_minutes: 99,
        },
        15
      )
    ).toBe(60);
  });

  it("rejects invalid duration and buffer values", () => {
    expect(() =>
      getServiceTotalMinutes({ duration_minutes: 0, buffer_minutes: 15 }, 15)
    ).toThrow(ValidationError);
    expect(() =>
      getServiceTotalMinutes({ duration_minutes: 30, buffer_minutes: 15 }, -1)
    ).toThrow(ValidationError);
  });

  it("parses and formats valid times", () => {
    expect(parseTimeToMinutes("09:15")).toBe(555);
    expect(formatMinutesAsTime(615)).toBe("10:15");
  });

  it("rejects malformed times", () => {
    expect(() => parseTimeToMinutes("25:00")).toThrow(ValidationError);
    expect(() => parseTimeToMinutes("09:75")).toThrow(ValidationError);
  });

  it("allows only appointments fully contained between 09:00 and 18:00", () => {
    expect(() => assertWithinWorkingHours(540, 1080)).not.toThrow();
    expect(() => assertWithinWorkingHours(539, 600)).toThrow(ValidationError);
    expect(() => assertWithinWorkingHours(1020, 1081)).toThrow(ValidationError);
  });

  it("treats Monday through Saturday as working days", () => {
    expect(isWorkingDay("2026-06-22")).toBe(true);
    expect(isWorkingDay("2026-06-27")).toBe(true);
    expect(isWorkingDay("2026-06-28")).toBe(false);
  });
});
