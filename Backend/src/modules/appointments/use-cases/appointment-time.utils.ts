import { ValidationError } from "../../../shared/errors";
import { getCalendarDayOfWeek } from "../../../shared/utils";

export const WORK_START_MINUTES = 9 * 60;
export const WORK_END_MINUTES = 18 * 60;
export const SLOT_INTERVAL_MINUTES = 15;

interface WorkingHours {
  is_open: boolean;
  start_time: string | null;
  end_time: string | null;
}

export function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);

  if (
    !Number.isInteger(hours) ||
    !Number.isInteger(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    throw new ValidationError("Start time must be a valid HH:MM time");
  }

  return hours * 60 + minutes;
}

export function formatMinutesAsTime(totalMinutes: number): string {
  if (!Number.isInteger(totalMinutes) || totalMinutes < 0 || totalMinutes >= 24 * 60) {
    throw new ValidationError("Appointment end time is outside a valid day");
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function isWorkingDay(date: string): boolean {
  const dayOfWeek = getCalendarDayOfWeek(date);
  return dayOfWeek >= 1 && dayOfWeek <= 6;
}

export function assertWithinWorkingHours(
  startMinutes: number,
  endMinutes: number,
  workingHours: WorkingHours = {
    is_open: true,
    start_time: formatMinutesAsTime(WORK_START_MINUTES),
    end_time: formatMinutesAsTime(WORK_END_MINUTES),
  }
): void {
  if (!workingHours.is_open || !workingHours.start_time || !workingHours.end_time) {
    throw new ValidationError("Appointments are not available for this day");
  }

  const workStartMinutes = parseTimeToMinutes(workingHours.start_time);
  const workEndMinutes = parseTimeToMinutes(workingHours.end_time);

  if (startMinutes < workStartMinutes || endMinutes > workEndMinutes) {
    throw new ValidationError(
      `Appointment must be between ${workingHours.start_time} and ${workingHours.end_time}`
    );
  }
}

export function getServiceTotalMinutes(service: {
  duration_minutes: unknown;
  buffer_minutes: unknown;
}): number {
  const durationMinutes = Number(service.duration_minutes);
  const bufferMinutes = Number(service.buffer_minutes);

  if (!Number.isInteger(durationMinutes) || durationMinutes <= 0) {
    throw new ValidationError("Service duration_minutes must be a positive integer");
  }

  if (!Number.isInteger(bufferMinutes) || bufferMinutes < 0) {
    throw new ValidationError("Service buffer_minutes must be zero or a positive integer");
  }

  return durationMinutes + bufferMinutes;
}
