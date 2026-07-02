import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { SETTINGS_FALLBACK, useSettingsStore } from "../../store/settingsStore";
import { classNames } from "../../utils/classNames";
import sharedStyles from "../ui/styles/shared.module.css";
import styles from "./Header.module.css";

export function Header() {
    const profile = useAuthStore((state) => state.profile);
    const logout = useAuthStore((state) => state.logout);
    const settings = useSettingsStore((state) => state.settings);
    const navigate = useNavigate();

    const systemName = settings?.system_name ?? SETTINGS_FALLBACK.systemName;
    const businessName = settings?.business_name ?? SETTINGS_FALLBACK.businessName;

    const initials =
        profile?.full_name
            ?.split(" ")
            .map((part) => part[0])
            .join("")
            .slice(0, 2)
            .toUpperCase() ?? "AD";

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <header className={styles.header}>
            <div className={styles.context}>
                <span>{businessName}</span>
                <strong>{systemName}</strong>
            </div>

            <div className={styles.user}>
                <div className={styles.profile}>
                    <strong>{profile?.full_name ?? "Administrador"}</strong>
                    <span>Administrador</span>
                </div>
                <span className={styles.avatar} aria-hidden="true">
                    {initials}
                </span>
                <button
                    className={classNames(sharedStyles.button, sharedStyles.buttonSecondary, sharedStyles.buttonQuiet)}
                    onClick={handleLogout}
                    type="button"
                >
                    Cerrar sesión
                </button>
            </div>
        </header>
    );
}

