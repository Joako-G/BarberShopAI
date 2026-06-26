import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ServicesForm } from "../components/services/ServicesForm";
import sharedStyles from "../components/ui/styles/shared.module.css";
import type { ServiceFormData } from "../schemas/serviceSchema";
import { notifyError, notifySuccess } from "../services/notifications";
import { getServiceById, updateService } from "../services/serviceApi";
import type { Service } from "../types/service";
import { classNames } from "../utils/classNames";

export function EditServicePage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [service, setService] = useState<Service | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const requestId = window.setTimeout(() => {
            const loadService = async () => {
                if (!id) {
                    setError("El servicio no es válido.");
                    setLoading(false);
                    return;
                }

                try {
                    setService(await getServiceById(id));
                } catch {
                    setError("No se pudo cargar el servicio.");
                } finally {
                    setLoading(false);
                }
            };

            void loadService();
        }, 0);

        return () => window.clearTimeout(requestId);
    }, [id]);

    const handleUpdate = async (data: ServiceFormData) => {
        if (!id) return;

        try {
            await updateService(id, {
                ...data,
                description: data.description?.trim() || null,
            });
            notifySuccess({
                title: "Servicio actualizado",
                description: "Los cambios se guardaron correctamente.",
            });
            navigate("/services");
        } catch {
            notifyError({
                title: "No se pudieron guardar los cambios",
                description: "Intentá nuevamente en unos segundos.",
            });
        }
    };

    if (loading) {
        return <div className={classNames(sharedStyles.card, sharedStyles.loadingState)}><span className={sharedStyles.loadingSpinner} /><strong>Cargando servicio...</strong></div>;
    }

    if (!service) {
        return <div className={classNames(sharedStyles.notice, sharedStyles.noticeError)}>{error ?? "Servicio no encontrado."}</div>;
    }

    return (
        <section className={sharedStyles.page}>
            <header className={sharedStyles.pageHeader}>
                <div>
                    <span className={sharedStyles.pageEyebrow}>Catálogo</span>
                    <h1>Editar servicio</h1>
                    <p>Ajustá los detalles de {service.name}.</p>
                </div>
            </header>
            <ServicesForm
                initialValues={{
                    name: service.name,
                    description: service.description,
                    price: service.price,
                    duration_minutes: service.duration_minutes,
                }}
                onCancel={() => navigate("/services")}
                onSubmit={handleUpdate}
                submitText="Guardar cambios"
            />
        </section>
    );
}
