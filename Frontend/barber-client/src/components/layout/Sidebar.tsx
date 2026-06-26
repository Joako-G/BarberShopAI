import { Menu } from "lucide-react";
import { useState } from "react";
import { NavLink } from "react-router-dom";
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
];

export function Sidebar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const brand = (
        <div className={styles.brand}>
            <span className={styles.brandMark}>BS</span>
            <div className={styles.brandCopy}>
                <strong>BarberShop</strong>
                <span>Aura Management</span>
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
                    <span className={styles.brandMark}>BS</span>
                    <div className={styles.brandCopy}>
                        <strong>BarberShop</strong>
                        <span>Aura Management</span>
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
                                BarberShop
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
