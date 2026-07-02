import type {
    BusinessHour,
    BusinessSettings,
    BusinessSettingsRequest,
    UpdateBusinessHoursRequest,
    UpdateBusinessHoursResponse,
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
