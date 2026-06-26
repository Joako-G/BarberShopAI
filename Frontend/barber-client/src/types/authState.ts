import type { Profile, User } from "./auth";

export interface AuthState {
    user: User | null;
    profile: Profile | null;
    token: string | null;
    isAuthenticated: boolean;

    login: (user: User, profile: Profile, token: string) => void;
    logout: () => void;
}
