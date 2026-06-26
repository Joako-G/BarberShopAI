import { create } from "zustand"
import type { AuthState } from "../types/authState"
import { persist } from "zustand/middleware"

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            profile: null,
            token: null,
            isAuthenticated: false,

            login: (user, profile, token) => set({
                user,
                profile,
                token,
                isAuthenticated: true,
            }),

            logout: () => set({
                user: null,
                profile: null,
                token: null,
                isAuthenticated: false,
            }),

        }),
        {
            name: 'auth-storage'
        }
    )
)