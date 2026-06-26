import type { DashboardData } from "../types/stats";
import { axioClient, getAuthorizationHeaders } from "./axioClient";

export async function getStats(): Promise<DashboardData> {
    const response = await axioClient.get('/dashboard/stats', {
        headers: getAuthorizationHeaders(),
    });

    return response.data.data;
}
