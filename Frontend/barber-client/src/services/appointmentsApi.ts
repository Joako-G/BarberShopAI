import type {
    Appointment,
    AppointmentAction,
    AppointmentFilters,
    AvailableSlotsParams,
    CreateAdminAppointmentRequest,
    CreatePublicAppointmentRequest,
    UpdateAppointmentRequest,
} from "../types/appointment";
import { axioClient, getAuthorizationHeaders } from "./axioClient";

export async function getAllAppointments(
    filters: AppointmentFilters = {}
): Promise<Appointment[]> {
    const response = await axioClient.get("/appointments", {
        headers: getAuthorizationHeaders(),
        params: filters,
    });

    return response.data.data;
}

export async function getAppointmentById(id: string): Promise<Appointment> {
    const response = await axioClient.get(`/appointments/${id}`, {
        headers: getAuthorizationHeaders(),
    });

    return response.data.data;
}

export async function changeAppointmentStatus(
    id: string,
    action: AppointmentAction
): Promise<Appointment> {
    const response = await axioClient.patch(
        `/appointments/${id}/${action}`,
        undefined,
        {
            headers: getAuthorizationHeaders(),
        }
    );

    return response.data.data;
}

export async function createAdminAppointment(
    appointmentRequest: CreateAdminAppointmentRequest
): Promise<Appointment> {
    const response = await axioClient.post(
        "/appointments",
        appointmentRequest,
        {
            headers: getAuthorizationHeaders(),
        }
    );

    return response.data.data;
}

export async function createPublicAppointment(
    appointmentRequest: CreatePublicAppointmentRequest
): Promise<Appointment> {
    const response = await axioClient.post(
        "/appointments/public",
        appointmentRequest
    );

    return response.data.data;
}

export async function updateAppointment(
    id: string,
    appointmentRequest: UpdateAppointmentRequest
): Promise<Appointment> {
    const response = await axioClient.put(
        `/appointments/${id}`,
        appointmentRequest,
        {
            headers: getAuthorizationHeaders(),
        }
    );

    return response.data.data;
}

export async function getAvailableSlots(
    params: AvailableSlotsParams
): Promise<string[]> {
    const response = await axioClient.get("/available-slots", { params });
    return response.data.data;
}
