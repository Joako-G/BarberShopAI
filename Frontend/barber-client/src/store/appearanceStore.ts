import { create } from "zustand";
import type { CSSProperties } from "react";
import { getAppearanceSettings } from "../services/settingsApi";
import type { AppearanceSettings } from "../types/settings";

export const APPEARANCE_FALLBACK: AppearanceSettings = {
    id: "fallback",
    theme_mode: "light",
    primary_color: "#006590",
    secondary_color: "#455F87",
    accent_color: "#E1B935",
    background_color: "#F5FAFF",
    text_color: "#171C20",
    border_radius: 8,
    created_at: "",
    updated_at: "",
};

export type AppearanceCssVariables = CSSProperties & {
    "--color-primary": string;
    "--color-secondary": string;
    "--color-accent": string;
    "--color-bg": string;
    "--color-text": string;
    "--radius-base": string;
    "--primary": string;
    "--primary-container": string;
    "--on-primary-container": string;
    "--secondary": string;
    "--tertiary": string;
    "--tertiary-container": string;
    "--surface": string;
    "--surface-container-low": string;
    "--surface-container": string;
    "--surface-container-high": string;
    "--surface-container-highest": string;
    "--surface-lowest": string;
    "--on-surface": string;
    "--on-surface-variant": string;
    "--outline": string;
    "--outline-variant": string;
    "--radius": string;
    "--radius-md": string;
    "--radius-lg": string;
    "--radius-xl": string;
    "--shadow-focus": string;
};

interface AppearanceState {
    appearanceSettings: AppearanceSettings;
    loading: boolean;
    error: string | null;
    loadAppearanceSettings: () => Promise<AppearanceSettings>;
    setAppearanceSettings: (settings: AppearanceSettings) => void;
    clearAppearanceSettings: () => void;
}

export function getAppearanceCssVariables(
    settings: AppearanceSettings
): AppearanceCssVariables {
    const surfaceMixAmount = settings.theme_mode === "dark" ? "10%" : "4%";
    const containerMixAmount = settings.theme_mode === "dark" ? "12%" : "6%";
    const elevatedMixAmount = settings.theme_mode === "dark" ? "16%" : "0%";
    const variantMixAmount = settings.theme_mode === "dark" ? "68%" : "72%";

    return {
        "--color-primary": settings.primary_color,
        "--color-secondary": settings.secondary_color,
        "--color-accent": settings.accent_color,
        "--color-bg": settings.background_color,
        "--color-text": settings.text_color,
        "--radius-base": `${settings.border_radius}px`,
        "--primary": settings.primary_color,
        "--primary-container": `color-mix(in srgb, ${settings.primary_color} 34%, ${settings.background_color})`,
        "--on-primary-container": settings.theme_mode === "dark" ? settings.text_color : settings.background_color,
        "--secondary": settings.secondary_color,
        "--tertiary": settings.accent_color,
        "--tertiary-container": `color-mix(in srgb, ${settings.accent_color} 34%, ${settings.background_color})`,
        "--surface": settings.background_color,
        "--surface-container-low": `color-mix(in srgb, ${settings.text_color} ${surfaceMixAmount}, ${settings.background_color})`,
        "--surface-container": `color-mix(in srgb, ${settings.text_color} ${containerMixAmount}, ${settings.background_color})`,
        "--surface-container-high": `color-mix(in srgb, ${settings.text_color} ${elevatedMixAmount}, ${settings.background_color})`,
        "--surface-container-highest": `color-mix(in srgb, ${settings.text_color} 22%, ${settings.background_color})`,
        "--surface-lowest": `color-mix(in srgb, ${settings.text_color} ${elevatedMixAmount}, ${settings.background_color})`,
        "--on-surface": settings.text_color,
        "--on-surface-variant": `color-mix(in srgb, ${settings.text_color} ${variantMixAmount}, ${settings.secondary_color})`,
        "--outline": settings.secondary_color,
        "--outline-variant": `color-mix(in srgb, ${settings.secondary_color} 42%, ${settings.background_color})`,
        "--radius": `${settings.border_radius}px`,
        "--radius-md": `${settings.border_radius + 4}px`,
        "--radius-lg": `${settings.border_radius + 8}px`,
        "--radius-xl": `${settings.border_radius + 16}px`,
        "--shadow-focus": `0 0 0 4px color-mix(in srgb, ${settings.primary_color} 22%, transparent)`,
    };
}

export const useAppearanceStore = create<AppearanceState>((set, get) => ({
    appearanceSettings: APPEARANCE_FALLBACK,
    loading: false,
    error: null,

    loadAppearanceSettings: async () => {
        const current = get().appearanceSettings;

        if (current.id !== APPEARANCE_FALLBACK.id) {
            return current;
        }

        set({ loading: true, error: null });

        try {
            const settings = await getAppearanceSettings();
            set({ appearanceSettings: settings, loading: false, error: null });
            return settings;
        } catch (error) {
            set({
                appearanceSettings: APPEARANCE_FALLBACK,
                loading: false,
                error: "No se pudo cargar la apariencia.",
            });
            throw error;
        }
    },

    setAppearanceSettings: (settings) =>
        set({ appearanceSettings: settings, error: null }),

    clearAppearanceSettings: () =>
        set({
            appearanceSettings: APPEARANCE_FALLBACK,
            loading: false,
            error: null,
        }),
}));
