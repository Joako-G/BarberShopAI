import { loadEnv } from "../../config/env";

const env = loadEnv();

export const BUSINESS_TIME_ZONE = env.APP_TIMEZONE;

export interface BusinessDateTimeParts {
  date: string;
  time: string;
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
}

function getPart(
  parts: Intl.DateTimeFormatPart[],
  type: Intl.DateTimeFormatPartTypes
): string {
  return parts.find((part) => part.type === type)?.value ?? "";
}

export function getBusinessDateTimeParts(
  instant = new Date(),
  timeZone = BUSINESS_TIME_ZONE
): BusinessDateTimeParts {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(instant);

  const yearText = getPart(parts, "year");
  const monthText = getPart(parts, "month");
  const dayText = getPart(parts, "day");
  const hourText = getPart(parts, "hour");
  const minuteText = getPart(parts, "minute");

  return {
    date: `${yearText}-${monthText}-${dayText}`,
    time: `${hourText}:${minuteText}`,
    year: Number(yearText),
    month: Number(monthText),
    day: Number(dayText),
    hour: Number(hourText),
    minute: Number(minuteText),
  };
}

export function getBusinessDate(instant = new Date()): string {
  return getBusinessDateTimeParts(instant).date;
}

export function getBusinessTime(instant = new Date()): string {
  return getBusinessDateTimeParts(instant).time;
}

export function isBusinessDateTimePastOrNow(
  date: string,
  time: string,
  instant = new Date()
): boolean {
  const current = getBusinessDateTimeParts(instant);

  return date < current.date || (date === current.date && time <= current.time);
}

export function isValidCalendarDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) return false;

  const [, yearText, monthText, dayText] = match;
  const date = new Date(
    Date.UTC(Number(yearText), Number(monthText) - 1, Number(dayText))
  );

  return (
    date.getUTCFullYear() === Number(yearText) &&
    date.getUTCMonth() === Number(monthText) - 1 &&
    date.getUTCDate() === Number(dayText)
  );
}

export function getCalendarDayOfWeek(value: string): number {
  if (!isValidCalendarDate(value)) {
    return Number.NaN;
  }

  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}
