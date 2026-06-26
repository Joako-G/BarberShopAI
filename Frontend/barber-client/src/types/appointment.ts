export type AppointmentStatus =
    | "pending"
    | "confirmed"
    | "completed"
    | "cancelled"
    | "no_show";

export type AppointmentAction = "confirm" | "cancel" | "complete" | "no-show";

export interface AppointmentCustomer {
    id: string;
    full_name: string;
    phone: string;
    email: string | null;
}

export interface AppointmentService {
    id: string;
    name: string;
    description: string | null;
    duration_minutes: number;
    buffer_minutes: number;
    price: number;
    is_active: boolean;
}

export interface Appointment {
    id: string;
    customer_id: string | null;
    guest_full_name: string | null;
    guest_phone: string | null;
    guest_email: string | null;
    barber_id: string | null;
    service_id: string;
    appointment_date: string;
    start_time: string;
    end_time: string;
    status: AppointmentStatus;
    notes: string | null;
    created_at: string;
    updated_at: string | null;
    customer: AppointmentCustomer | null;
    service: AppointmentService;
}

export interface AppointmentFilters {
    date?: string;
    status?: AppointmentStatus;
    customer?: string;
}

interface AppointmentScheduleRequest {
    service_id: string;
    appointment_date: string;
    start_time: string;
    notes: string | null;
}

export type CreateAdminAppointmentRequest =
    | (AppointmentScheduleRequest & {
        customer_mode: "existing";
        customer_id: string;
    })
    | (AppointmentScheduleRequest & {
        customer_mode: "new";
        full_name: string;
        phone: string;
        email: string | null;
    });

export type UpdateAppointmentRequest = AppointmentScheduleRequest;

export interface CreatePublicAppointmentRequest extends AppointmentScheduleRequest {
    full_name: string;
    phone: string;
    email: string | null;
}

export interface AvailableSlotsParams {
    serviceId: string;
    date: string;
    excludeAppointmentId?: string;
}
