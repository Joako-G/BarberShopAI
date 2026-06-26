import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CustomerTable } from "../components/customers/CustomerTable";
import sharedStyles from "../components/ui/styles/shared.module.css";
import { getCustomers } from "../services/customerApi";
import type { Customer } from "../types/customer";
import { classNames } from "../utils/classNames";

export function CustomerPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const requestId = window.setTimeout(() => {
            const loadCustomers = async () => {
                try {
                    setCustomers(await getCustomers());
                } catch {
                    setError("No se pudieron cargar los clientes.");
                } finally {
                    setLoading(false);
                }
            };

            void loadCustomers();
        }, 0);

        return () => window.clearTimeout(requestId);
    }, []);

    return (
        <section className={sharedStyles.page}>
            <header className={sharedStyles.pageHeader}>
                <div>
                    <span className={sharedStyles.pageEyebrow}>Directorio</span>
                    <h1>Clientes</h1>
                    <p>Información de contacto centralizada para una atención más personal.</p>
                </div>
                <button className={classNames(sharedStyles.button, sharedStyles.buttonPrimary)} onClick={() => navigate("/customers/new")} type="button">
                    + Nuevo cliente
                </button>
            </header>

            <section className={sharedStyles.card}>
                <div className={sharedStyles.cardHeader}>
                    <div>
                        <h2>Base de clientes</h2>
                        <span className={sharedStyles.tableSecondary}>{customers.length} registrados</span>
                    </div>
                </div>

                {loading ? (
                    <div className={sharedStyles.loadingState}>
                        <span className={sharedStyles.loadingSpinner} />
                        <strong>Cargando clientes…</strong>
                    </div>
                ) : error ? (
                    <div className={sharedStyles.errorState}>
                        <strong>No pudimos cargar los clientes</strong>
                        <span>{error}</span>
                    </div>
                ) : customers.length === 0 ? (
                    <div className={sharedStyles.emptyState}>
                        <strong>Todavía no hay clientes</strong>
                        <span>Registrá el primero para comenzar.</span>
                    </div>
                ) : (
                    <CustomerTable
                        customers={customers}
                        handleEditCustomer={(id) => navigate(`/customers/${id}/edit`)}
                    />
                )}
            </section>
        </section>
    );
}
