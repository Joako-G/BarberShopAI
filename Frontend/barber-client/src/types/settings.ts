export interface BusinessSettings {
    id: string;
    system_name: string;
    business_name: string;
    business_type: string | null;
    description: string | null;
    phone: string | null;
    whatsapp: string | null;
    email: string | null;
    address: string | null;
    created_at: string;
    updated_at: string;
}

export interface BusinessSettingsRequest {
    system_name: string;
    business_name: string;
    business_type?: string | null;
    description?: string | null;
    phone?: string | null;
    whatsapp?: string | null;
    email?: string | null;
    address?: string | null;
}

export interface UpdateBusinessSettingsResponse {
    message: string;
    settings: BusinessSettings;
}

