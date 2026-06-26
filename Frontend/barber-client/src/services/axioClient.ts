import axios from 'axios';
import { useAuthStore } from '../store/authStore';

export const SESSION_EXPIRED_STORAGE_KEY = "barbershop-session-expired";

export const axioClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json',
    }
});

function hasAuthorizationHeader(headers: unknown): boolean {
    if (!headers || typeof headers !== "object") {
        return false;
    }

    if ("get" in headers && typeof headers.get === "function") {
        return Boolean(headers.get("Authorization"));
    }

    const record = headers as Record<string, unknown>;
    return Boolean(record.Authorization ?? record.authorization);
}

axioClient.interceptors.response.use(
    (response) => response,
    (error: unknown) => {
        if (
            axios.isAxiosError(error) &&
            error.response?.status === 401 &&
            error.config?.url !== "/auth/login" &&
            hasAuthorizationHeader(error.config?.headers)
        ) {
            const authState = useAuthStore.getState();

            if (authState.token || authState.isAuthenticated) {
                authState.logout();
                sessionStorage.setItem(SESSION_EXPIRED_STORAGE_KEY, "true");
            }
        }

        return Promise.reject(error);
    }
);

export function getAuthorizationHeaders(): { Authorization: string } {
    const token = useAuthStore.getState().token;

    if (!token) {
        throw new Error("La sesión no está disponible. Iniciá sesión nuevamente.");
    }

    return {
        Authorization: `Bearer ${token}`,
    };
}
