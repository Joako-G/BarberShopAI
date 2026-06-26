import type { Customer, CustomerRequest } from "../types/customer";
import { axioClient, getAuthorizationHeaders } from "./axioClient";

export async function getCustomers(): Promise<Customer[]> {
    const response = await axioClient.get('/customers', {
        headers: getAuthorizationHeaders(),
    });

    return response.data.data;
}

export async function getCustomerById(id: string): Promise<Customer> {
    const response = await axioClient.get(`/customers/${id}`, {
        headers: getAuthorizationHeaders(),
    });

    return response.data.data;
}

export async function createCustomer(customerRequest: CustomerRequest): Promise<Customer> {
    const response = await axioClient.post("/customers", customerRequest, {
        headers: getAuthorizationHeaders(),
    });

    return response.data.data;
}

export async function updateCustomer(id: string, customerRequest: CustomerRequest): Promise<Customer> {
    const response = await axioClient.put(
        `/customers/${id}`,
        customerRequest,
        {
            headers: getAuthorizationHeaders(),
        }
    );

    return response.data.data;
}
