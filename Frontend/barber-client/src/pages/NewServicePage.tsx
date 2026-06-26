import { useNavigate } from "react-router-dom";
import { ServicesForm } from "../components/services/ServicesForm";
import type { ServiceFormData } from "../schemas/serviceSchema";
import { notifyError, notifySuccess } from "../services/notifications";
import { createService } from "../services/serviceApi";
import sharedStyles from "../components/ui/styles/shared.module.css";

export function NewServicePage() {
    const navigate = useNavigate();

    const handleCreate = async (data: ServiceFormData) => {
        try {
            await createService({
                ...data,
                description: data.description?.trim() || null,
            });
            notifySuccess({
                title: "Servicio creado",
                description: "El servicio quedó disponible en el catálogo.",
            });
            navigate("/services");
        } catch {
            notifyError({
                title: "No se pudo crear el servicio",
                description: "Revisá los datos e intentá nuevamente.",
            });
        }
    };

    return (
        <section className={sharedStyles.page}>
            <header className={sharedStyles.pageHeader}>
                <div>
                    <span className={sharedStyles.pageEyebrow}>Catálogo</span>
                    <h1>Nuevo servicio</h1>
                    <p>Definí nombre, precio y duración de la experiencia.</p>
                </div>
            </header>
            <ServicesForm
                onCancel={() => navigate("/services")}
                onSubmit={handleCreate}
                submitText="Crear servicio"
            />
        </section>
    );
}
