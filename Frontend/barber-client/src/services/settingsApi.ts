import type {
    AppearanceSettings,
    AppearanceSettingsRequest,
    AppointmentSettings,
    AppointmentSettingsRequest,
    BusinessHour,
    BusinessSettings,
    BusinessSettingsRequest,
    UpdateBusinessHoursRequest,
    UpdateBusinessHoursResponse,
    UpdateAppearanceSettingsResponse,
    UpdateAppointmentSettingsResponse,
    UpdateBusinessSettingsResponse,
} from "../types/settings";
import { axioClient, getAuthorizationHeaders } from "./axioClient";

export async function getGeneralSettings(): Promise<BusinessSettings> {
    const response = await axioClient.get("/settings/general", {
        headers: getAuthorizationHeaders(),
    });

    return response.data.data;
}

export async function updateGeneralSettings(
    settings: BusinessSettingsRequest
): Promise<UpdateBusinessSettingsResponse> {
    const response = await axioClient.put("/settings/general", settings, {
        headers: getAuthorizationHeaders(),
    });

    return response.data.data;
}

export async function getBusinessHours(): Promise<BusinessHour[]> {
    const response = await axioClient.get("/settings/business-hours", {
        headers: getAuthorizationHeaders(),
    });

    return response.data.data;
}

export async function updateBusinessHours(
    payload: UpdateBusinessHoursRequest
): Promise<UpdateBusinessHoursResponse> {
    const response = await axioClient.put("/settings/business-hours", payload, {
        headers: getAuthorizationHeaders(),
    });

    return response.data.data;
}

export async function getAppointmentSettings(): Promise<AppointmentSettings> {
    const response = await axioClient.get("/settings/appointments", {
        headers: getAuthorizationHeaders(),
    });

    return response.data.data;
}

export async function updateAppointmentSettings(
    settings: AppointmentSettingsRequest
): Promise<UpdateAppointmentSettingsResponse> {
    const response = await axioClient.put("/settings/appointments", settings, {
        headers: getAuthorizationHeaders(),
    });

    return response.data.data;
}

export async function getAppearanceSettings(): Promise<AppearanceSettings> {
    const response = await axioClient.get("/settings/appearance", {
        headers: getAuthorizationHeaders(),
    });

    return response.data.data;
}

export async function updateAppearanceSettings(
    settings: AppearanceSettingsRequest
): Promise<UpdateAppearanceSettingsResponse> {
    const response = await axioClient.put("/settings/appearance", settings, {
        headers: getAuthorizationHeaders(),
    });

    return response.data.data;
}
