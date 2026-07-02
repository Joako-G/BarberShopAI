import { Menu } from "lucide-react";
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { SETTINGS_FALLBACK, useSettingsStore } from "../../store/settingsStore";
import { Button } from "../ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "../ui/sheet";
import styles from "./Sidebar.module.css";

const navigation = [
    { to: "/dashboard", label: "Dashboard", icon: "DB" },
    { to: "/appointments", label: "Turnos", icon: "TU" },
    { to: "/customers", label: "Clientes", icon: "CL" },
    { to: "/services", label: "Servicios", icon: "SV" },
    { to: "/settings", label: "Configuración", icon: "CF" },
];

export function Sidebar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const settings = useSettingsStore((state) => state.settings);

    const systemName = settings?.system_name ?? SETTINGS_FALLBACK.systemName;
    const businessType = settings?.business_type ?? SETTINGS_FALLBACK.businessType;
    const brandInitials = systemName
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    const brand = (
        <div className={styles.brand}>
            <span className={styles.brandMark}>{brandInitials}</span>
            <div className={styles.brandCopy}>
                <strong>{systemName}</strong>
                <span>{businessType}</span>
            </div>
        </div>
    );

    const navigationList = (
        <nav className={styles.nav} aria-label="Navegación principal">
            <p className={styles.navLabel}>Sistema</p>
            <ul>
                {navigation.map((item) => (
                    <li key={item.to}>
                        <NavLink to={item.to} onClick={() => setIsMobileMenuOpen(false)}>
                            <span className={styles.navIcon}>{item.icon}</span>
                            {item.label}
                        </NavLink>
                    </li>
                ))}
            </ul>
        </nav>
    );

    return (
        <>
            <aside className={styles.sidebar}>
                {brand}
                {navigationList}
                <div className={styles.footer}>Barbería unipersonal · MVP</div>
            </aside>

            <div className={styles.mobileBar}>
                <div className={styles.mobileBrand}>
                    <span className={styles.brandMark}>{brandInitials}</span>
                    <div className={styles.brandCopy}>
                        <strong>{systemName}</strong>
                        <span>{businessType}</span>
                    </div>
                </div>

                <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                    <SheetTrigger asChild>
                        <Button
                            aria-label="Abrir menú de navegación"
                            className={styles.menuButton}
                            size="icon"
                            type="button"
                            variant="ghost"
                        >
                            <Menu aria-hidden="true" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent className={styles.mobileSheet} side="right">
                        <SheetHeader className={styles.mobileSheetHeader}>
                            <SheetTitle className={styles.mobileSheetTitle}>
                                {systemName}
                            </SheetTitle>
                        </SheetHeader>
                        {navigationList}
                        <div className={styles.mobileFooter}>Barbería unipersonal · MVP</div>
                    </SheetContent>
                </Sheet>
            </div>
        </>
    );
}
