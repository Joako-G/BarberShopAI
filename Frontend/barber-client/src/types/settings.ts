export interface BusinessSettings {
    id: string;
    system_name: string;
    business_name: string;
    business_type: string | null;
    description: string | null;
    phone: string | null;
    whatsapp: string | null;
    email: string | null;
    address: string | null;
    created_at: string;
    updated_at: string;
}

export interface BusinessSettingsRequest {
    system_name: string;
    business_name: string;
    business_type?: string | null;
    description?: string | null;
    phone?: string | null;
    whatsapp?: string | null;
    email?: string | null;
    address?: string | null;
}

export interface UpdateBusinessSettingsResponse {
    message: string;
    settings: BusinessSettings;
}

export interface BusinessHour {
    id: string;
    day_of_week: number;
    is_open: boolean;
    start_time: string | null;
    end_time: string | null;
    created_at: string;
    updated_at: string;
}

export interface BusinessHourRequest {
    day_of_week: number;
    is_open: boolean;
    start_time?: string | null;
    end_time?: string | null;
}

export interface UpdateBusinessHoursRequest {
    hours: BusinessHourRequest[];
}

export interface UpdateBusinessHoursResponse {
    message: string;
    hours: BusinessHour[];
}

export interface AppointmentSettings {
    id: string;
    slot_interval_minutes: 5 | 10 | 15 | 20 | 30 | 60;
    default_buffer_minutes: number;
    min_booking_notice_minutes: number;
    max_booking_days_ahead: number;
    auto_confirm_appointments: boolean;
    allow_pending_appointments: boolean;
    created_at: string;
    updated_at: string;
}

export interface AppointmentSettingsRequest {
    slot_interval_minutes: 5 | 10 | 15 | 20 | 30 | 60;
    default_buffer_minutes: number;
    min_booking_notice_minutes: number;
    max_booking_days_ahead: number;
    auto_confirm_appointments: boolean;
    allow_pending_appointments: boolean;
}

export interface UpdateAppointmentSettingsResponse {
    message: string;
    settings: AppointmentSettings;
}

export type ThemeMode = "dark" | "light";

export interface AppearanceSettings {
    id: string;
    theme_mode: ThemeMode;
    primary_color: string;
    secondary_color: string;
    accent_color: string;
    background_color: string;
    text_color: string;
    border_radius: number;
    created_at: string;
    updated_at: string;
}

export interface AppearanceSettingsRequest {
    theme_mode: ThemeMode;
    primary_color: string;
    secondary_color: string;
    accent_color: string;
    background_color: string;
    text_color: string;
    border_radius: number;
}

export interface UpdateAppearanceSettingsResponse {
    message: string;
    settings: AppearanceSettings;
}

export type CalendarExceptionType = "CLOSED_DAY" | "SPECIAL_HOURS" | "VACATION";

export interface CalendarException {
    id: string;
    type: CalendarExceptionType;
    title: string;
    start_date: string;
    end_date: string;
    is_closed: boolean;
    special_start_time: string | null;
    special_end_time: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
}

export interface CalendarExceptionRequest {
    type: CalendarExceptionType;
    title: string;
    start_date: string;
    end_date: string;
    special_start_time?: string | null;
    special_end_time?: string | null;
    notes?: string | null;
}

export interface CalendarExceptionResponse {
    message: string;
    exception: CalendarException;
}

export interface DeleteCalendarExceptionResponse {
    message: string;
}
