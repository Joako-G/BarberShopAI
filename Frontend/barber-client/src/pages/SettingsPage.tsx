import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GeneralSettingsForm } from "../components/settings/GeneralSettingsForm";
import sharedStyles from "../components/ui/styles/shared.module.css";
import type { SettingsFormData } from "../schemas/settingsSchema";
import { notifyError, notifySuccess } from "../services/notifications";
import { updateGeneralSettings } from "../services/settingsApi";
import { useSettingsStore } from "../store/settingsStore";
import { classNames } from "../utils/classNames";

export function SettingsPage() {
    const navigate = useNavigate();
    const settings = useSettingsStore((state) => state.settings);
    const loading = useSettingsStore((state) => state.loading);
    const error = useSettingsStore((state) => state.error);
    const loadSettings = useSettingsStore((state) => state.loadSettings);
    const setSettings = useSettingsStore((state) => state.setSettings);

    useEffect(() => {
        void loadSettings().catch(() => undefined);
    }, [loadSettings]);

    const handleUpdate = async (data: SettingsFormData) => {
        try {
            const response = await updateGeneralSettings(data);
            setSettings(response.settings);
            notifySuccess({
                title: "Configuración actualizada",
                description: "Los datos generales se guardaron correctamente.",
            });
        } catch {
            notifyError({
                title: "No se pudo guardar la configuración",
                description: "Revisá los datos e intentá nuevamente.",
            });
        }
    };

    return (
        <section className={sharedStyles.page}>
            <header className={sharedStyles.pageHeader}>
                <div>
                    <span className={sharedStyles.pageEyebrow}>Sistema</span>
                    <h1>Configuración</h1>
                    <p>Personalizá los datos principales del negocio y del panel administrativo.</p>
                </div>
            </header>

            {loading && !settings ? (
                <div className={classNames(sharedStyles.card, sharedStyles.loadingState)}>
                    <span className={sharedStyles.loadingSpinner} />
                    <strong>Cargando configuración...</strong>
                </div>
            ) : error && !settings ? (
                <div className={classNames(sharedStyles.card, sharedStyles.errorState)}>
                    <strong>No pudimos cargar la configuración</strong>
                    <span>{error}</span>
                    <button
                        className={classNames(sharedStyles.button, sharedStyles.buttonPrimary)}
                        onClick={() => void loadSettings().catch(() => undefined)}
                        type="button"
                    >
                        Reintentar
                    </button>
                </div>
            ) : settings ? (
                <GeneralSettingsForm
                    initialValues={settings}
                    onCancel={() => navigate("/dashboard")}
                    onSubmit={handleUpdate}
                />
            ) : (
                <div className={classNames(sharedStyles.card, sharedStyles.emptyState)}>
                    <strong>No hay configuración disponible</strong>
                    <span>Intentá recargar la página.</span>
                </div>
            )}
        </section>
    );
}

