import { BusinessHour } from "../types";

export const DEFAULT_BUSINESS_HOURS: Array<
  Omit<BusinessHour, "id" | "created_at" | "updated_at">
> = [
  { day_of_week: 0, is_open: false, start_time: null, end_time: null },
  { day_of_week: 1, is_open: true, start_time: "09:00", end_time: "22:00" },
  { day_of_week: 2, is_open: true, start_time: "09:00", end_time: "22:00" },
  { day_of_week: 3, is_open: true, start_time: "09:00", end_time: "22:00" },
  { day_of_week: 4, is_open: true, start_time: "09:00", end_time: "22:00" },
  { day_of_week: 5, is_open: true, start_time: "09:00", end_time: "22:00" },
  { day_of_week: 6, is_open: true, start_time: "09:00", end_time: "22:00" },
];

export type BusinessHourSchedule = (typeof DEFAULT_BUSINESS_HOURS)[number];
