export interface LoginRequest {
    email: string;
    password: string;
}

export interface User {
    id: string;
    email: string;
}

export interface Profile {
    id: string;
    full_name: string;
    phone: string;
    role: string;
    is_active: boolean;
}

export interface LoginResponse {
    user: User;
    profile: Profile;
    token :string;
}

