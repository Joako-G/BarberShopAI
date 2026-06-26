import { Outlet } from "react-router-dom";
import { Header } from "../components/layout/Header";
import { Sidebar } from "../components/layout/Sidebar";
import styles from "./DashboardLayout.module.css";

export function DashboardLayout() {
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
