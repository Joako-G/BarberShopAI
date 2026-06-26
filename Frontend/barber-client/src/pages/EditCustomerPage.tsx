import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CustomerForm } from "../components/customers/CustomerForm";
import sharedStyles from "../components/ui/styles/shared.module.css";
import type { CustomerFormData } from "../schemas/customerSchema";
import { getCustomerById, updateCustomer } from "../services/customerApi";
import { notifyError, notifySuccess } from "../services/notifications";
import type { Customer } from "../types/customer";
import { classNames } from "../utils/classNames";

export function EditCustomerPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const requestId = window.setTimeout(() => {
            const loadCustomer = async () => {
                if (!id) {
                    setError("El cliente no es válido.");
                    setLoading(false);
                    return;
                }

                try {
                    setCustomer(await getCustomerById(id));
                } catch {
                    setError("No se pudieron cargar los datos del cliente.");
                } finally {
                    setLoading(false);
                }
            };

            void loadCustomer();
        }, 0);

        return () => window.clearTimeout(requestId);
    }, [id]);

    const handleUpdate = async (data: CustomerFormData) => {
        if (!id) return;

        try {
            await updateCustomer(id, data);
            notifySuccess({
                title: "Cliente actualizado",
                description: "Los cambios se guardaron correctamente.",
            });
            navigate("/customers");
        } catch {
            notifyError({
                title: "No se pudieron guardar los cambios",
                description: "Intentá nuevamente en unos segundos.",
            });
        }
    };

    if (loading) {
        return <div className={classNames(sharedStyles.card, sharedStyles.loadingState)}><span className={sharedStyles.loadingSpinner} /><strong>Cargando cliente...</strong></div>;
    }

    if (!customer) {
        return <div className={classNames(sharedStyles.notice, sharedStyles.noticeError)}>{error ?? "Cliente no encontrado."}</div>;
    }

    return (
        <section className={sharedStyles.page}>
            <header className={sharedStyles.pageHeader}>
                <div>
                    <span className={sharedStyles.pageEyebrow}>Directorio</span>
                    <h1>Editar cliente</h1>
                    <p>Actualizá la información de contacto de {customer.full_name}.</p>
                </div>
            </header>
            <CustomerForm
                initialValues={{
                    full_name: customer.full_name,
                    phone: customer.phone,
                    email: customer.email,
                }}
                onCancel={() => navigate("/customers")}
                onSubmit={handleUpdate}
                submitText="Guardar cambios"
            />
        </section>
    );
}
