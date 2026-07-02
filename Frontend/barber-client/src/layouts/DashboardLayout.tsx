import { Outlet } from "react-router-dom";
import { useEffect } from "react";
import { Header } from "../components/layout/Header";
import { Sidebar } from "../components/layout/Sidebar";
import { useSettingsStore } from "../store/settingsStore";
import styles from "./DashboardLayout.module.css";

export function DashboardLayout() {
    const loadSettings = useSettingsStore((state) => state.loadSettings);

    useEffect(() => {
        void loadSettings().catch(() => undefined);
    }, [loadSettings]);

    return (
        <div className={styles.shell}>
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
