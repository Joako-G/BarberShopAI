import { UpdateAppointmentSettingsDto } from "../types";

export const DEFAULT_APPOINTMENT_SETTINGS: UpdateAppointmentSettingsDto = {
  slot_interval_minutes: 15,
  default_buffer_minutes: 15,
  min_booking_notice_minutes: 0,
  max_booking_days_ahead: 30,
  auto_confirm_appointments: false,
  allow_pending_appointments: true,
};
