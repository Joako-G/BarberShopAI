import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { loginRequest } from "../services/authApi";
import { SESSION_EXPIRED_STORAGE_KEY } from "../services/axioClient";
import { notifyError, notifyWarning } from "../services/notifications";
import { useAuthStore } from "../store/authStore";
import { classNames } from "../utils/classNames";
import sharedStyles from "../components/ui/styles/shared.module.css";
import styles from "./LoginPage.module.css";

export function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [sessionExpired] = useState(() => {
        const expired =
            sessionStorage.getItem(SESSION_EXPIRED_STORAGE_KEY) === "true";
        sessionStorage.removeItem(SESSION_EXPIRED_STORAGE_KEY);
        return expired;
    });
    const login = useAuthStore((state) => state.login);
    const navigate = useNavigate();

    useEffect(() => {
        if (!sessionExpired) {
            return;
        }

        notifyWarning({
            title: "Sesión expirada",
            description: "Iniciá sesión nuevamente para continuar.",
        });
    }, [sessionExpired]);

    const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);

        try {
            const data = await loginRequest({ email, password });
            login(data.user, data.profile, data.token);
            navigate("/dashboard");
        } catch {
            notifyError({
                title: "No pudimos iniciar sesión",
                description: "Revisá tus credenciales e intentá nuevamente.",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className={styles.page}>
            <section className={styles.visual}>
                <div className={styles.brand}>
                    <span className={styles.brandMark}>BS</span>
                    BarberShop · Aura
                </div>
                <div className={styles.content}>
                    <span>Gestión boutique</span>
                    <h1>Tu barbería, perfectamente organizada.</h1>
                    <p>
                        Turnos, clientes y servicios en un espacio diseñado para trabajar
                        con calma, claridad y precisión.
                    </p>
                </div>
            </section>

            <section className={styles.panel}>
                <form className={styles.card} onSubmit={handleLogin}>
                    <span className={styles.eyebrow}>Acceso administrativo</span>
                    <h2>Bienvenido</h2>
                    <p>Ingresá con la cuenta del propietario para continuar.</p>

                    <div className={styles.form}>
                        <div className={sharedStyles.formField}>
                            <label htmlFor="email">Email</label>
                            <input
                                id="email"
                                type="email"
                                placeholder="admin@barbershop.com"
                                value={email}
                                required
                                onChange={(event) => setEmail(event.target.value)}
                            />
                        </div>

                        <div className={sharedStyles.formField}>
                            <label htmlFor="password">Contraseña</label>
                            <input
                                id="password"
                                type="password"
                                placeholder="Tu contraseña"
                                value={password}
                                required
                                onChange={(event) => setPassword(event.target.value)}
                            />
                        </div>

                        <button
                            className={classNames(sharedStyles.button, sharedStyles.buttonPrimary, styles.submit)}
                            disabled={loading}
                            type="submit"
                        >
                            {loading ? "Ingresando..." : "Iniciar sesión"}
                        </button>
                    </div>
                </form>
            </section>
        </main>
    );
}
