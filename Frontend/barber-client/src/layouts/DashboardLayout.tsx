import { Outlet } from "react-router-dom";
import { useEffect } from "react";
import { Header } from "../components/layout/Header";
import { Sidebar } from "../components/layout/Sidebar";
import {
    getAppearanceCssVariables,
    useAppearanceStore,
} from "../store/appearanceStore";
import { useSettingsStore } from "../store/settingsStore";
import styles from "./DashboardLayout.module.css";

export function DashboardLayout() {
    const loadSettings = useSettingsStore((state) => state.loadSettings);
    const appearanceSettings = useAppearanceStore((state) => state.appearanceSettings);
    const loadAppearanceSettings = useAppearanceStore(
        (state) => state.loadAppearanceSettings
    );

    useEffect(() => {
        void loadSettings().catch(() => undefined);
        void loadAppearanceSettings().catch(() => undefined);
    }, [loadAppearanceSettings, loadSettings]);

    return (
        <div
            className={styles.shell}
            style={getAppearanceCssVariables(appearanceSettings)}
        >
            <Sidebar />
            <div className={styles.frame}>
                <Header />
                <main className={styles.content}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
