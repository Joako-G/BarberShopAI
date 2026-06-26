export interface Customer {
    id: string;
    full_name: string;
    phone: string;
    email: string;
    updated_at: string;
    created_at: string;
}

export interface CustomerRequest {
    full_name: string;
    phone: string;
    email: string;
}