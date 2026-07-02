import { create } from "zustand";
import { getGeneralSettings } from "../services/settingsApi";
import type { BusinessSettings } from "../types/settings";

interface SettingsState {
    settings: BusinessSettings | null;
    loading: boolean;
    error: string | null;
    loadSettings: () => Promise<BusinessSettings>;
    setSettings: (settings: BusinessSettings) => void;
    clearSettings: () => void;
}

export const SETTINGS_FALLBACK = {
    systemName: "Sistema de Turnos",
    businessName: "Mi Negocio",
    businessType: "Gestión",
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
    settings: null,
    loading: false,
    error: null,

    loadSettings: async () => {
        const current = get().settings;

        if (current) {
            return current;
        }

        set({ loading: true, error: null });

        try {
            const settings = await getGeneralSettings();
            set({ settings, loading: false, error: null });
            return settings;
        } catch (error) {
            set({
                loading: false,
                error: "No se pudo cargar la configuración general.",
            });
            throw error;
        }
    },

    setSettings: (settings) => set({ settings, error: null }),

    clearSettings: () => set({ settings: null, loading: false, error: null }),
}));

