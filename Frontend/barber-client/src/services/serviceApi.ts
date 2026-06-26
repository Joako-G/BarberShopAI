import type { Service, ServiceRequest } from '../types/service';
import { axioClient, getAuthorizationHeaders } from './axioClient';

export async function getServices(): Promise<Service[]> {
    const response = await axioClient.get('/services/admin', {
        headers: getAuthorizationHeaders(),
    });

    return response.data.data;
}

export async function getActiveServices(): Promise<Service[]> {
    const response = await axioClient.get('/services');
    return response.data.data;
}

export async function getServiceById(id: string): Promise<Service> {
    const response = await axioClient.get(`/services/${id}`)
    return response.data.data
}

export async function updateService(id: string, serviceRequest: ServiceRequest): Promise<Service> {
    const response = await axioClient.put(
        `/services/${id}`,
        serviceRequest,
        {
            headers: getAuthorizationHeaders(),
        }
    )

    return response.data.data;
}

export const createService = async (serviceRequest: ServiceRequest): Promise<Service> => {
    const response = await axioClient.post('/services', serviceRequest, {
        headers: getAuthorizationHeaders(),
    });

    return response.data.data;
}

export const toggleState = async (id: string, is_active: boolean): Promise<Service> => {
    const response = await axioClient.patch(
        `/services/${id}/status`,
        { is_active },
        { headers: getAuthorizationHeaders() }
    );

    return response.data.data;
}
