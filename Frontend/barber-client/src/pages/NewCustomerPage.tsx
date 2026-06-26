import { useNavigate } from "react-router-dom";
import { CustomerForm } from "../components/customers/CustomerForm";
import type { CustomerFormData } from "../schemas/customerSchema";
import { createCustomer } from "../services/customerApi";
import { notifyError, notifySuccess } from "../services/notifications";
import sharedStyles from "../components/ui/styles/shared.module.css";

export function NewCustomerPage() {
    const navigate = useNavigate();

    const handleCreate = async (data: CustomerFormData) => {
        try {
            await createCustomer(data);
            notifySuccess({
                title: "Cliente creado",
                description: "El cliente se registró correctamente.",
            });
            navigate("/customers");
        } catch {
            notifyError({
                title: "No se pudo registrar el cliente",
                description: "Revisá los datos e intentá nuevamente.",
            });
        }
    };

    return (
        <section className={sharedStyles.page}>
            <header className={sharedStyles.pageHeader}>
                <div>
                    <span className={sharedStyles.pageEyebrow}>Directorio</span>
                    <h1>Nuevo cliente</h1>
                    <p>Guardá los datos esenciales para agilizar futuras reservas.</p>
                </div>
            </header>
            <CustomerForm
                onCancel={() => navigate("/customers")}
                onSubmit={handleCreate}
                submitText="Crear cliente"
            />
        </section>
    );
}
