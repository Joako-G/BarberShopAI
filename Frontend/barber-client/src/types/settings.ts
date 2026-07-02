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
