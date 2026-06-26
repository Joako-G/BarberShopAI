export interface Service {
    id: string;
    name: string;
    description: string;
    price: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    duration_minutes: number;
    buffer_minutes: number;
}

export interface ServiceRequest {
    name: string;
    description?: string | null;
    price: number;
    duration_minutes: number;
}