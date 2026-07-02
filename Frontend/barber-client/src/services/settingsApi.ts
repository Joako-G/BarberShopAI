import type {
    BusinessSettings,
    BusinessSettingsRequest,
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

