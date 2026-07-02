import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BusinessHoursForm } from "../components/settings/BusinessHoursForm";
import { GeneralSettingsForm } from "../components/settings/GeneralSettingsForm";
import sharedStyles from "../components/ui/styles/shared.module.css";
import type {
    BusinessHoursFormData,
    SettingsFormData,
} from "../schemas/settingsSchema";
import { notifyError, notifySuccess } from "../services/notifications";
import {
    getBusinessHours,
    updateBusinessHours,
    updateGeneralSettings,
} from "../services/settingsApi";
import { useSettingsStore } from "../store/settingsStore";
import type { BusinessHour } from "../types/settings";
import { classNames } from "../utils/classNames";

export function SettingsPage() {
    const navigate = useNavigate();
    const settings = useSettingsStore((state) => state.settings);
    const loading = useSettingsStore((state) => state.loading);
    const error = useSettingsStore((state) => state.error);
    const loadSettings = useSettingsStore((state) => state.loadSettings);
    const setSettings = useSettingsStore((state) => state.setSettings);
    const [businessHours, setBusinessHours] = useState<BusinessHour[] | null>(null);
    const [businessHoursLoading, setBusinessHoursLoading] = useState(false);
    const [businessHoursError, setBusinessHoursError] = useState<string | null>(null);

    const loadBusinessHours = useCallback(async () => {
        setBusinessHoursLoading(true);
        setBusinessHoursError(null);

        try {
            const hours = await getBusinessHours();
            setBusinessHours(hours);
        } catch {
            setBusinessHoursError("No se pudieron cargar los horarios laborales.");
        } finally {
            setBusinessHoursLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadSettings().catch(() => undefined);
        void loadBusinessHours();
    }, [loadBusinessHours, loadSettings]);

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

    const handleBusinessHoursUpdate = async (data: BusinessHoursFormData) => {
        try {
            const response = await updateBusinessHours(data);
            setBusinessHours(response.hours);
            notifySuccess({
                title: "Horarios actualizados",
                description: "Los horarios laborales se guardaron correctamente.",
            });
        } catch {
            notifyError({
                title: "No se pudieron guardar los horarios",
                description: "Revisá los días y horarios e intentá nuevamente.",
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

            {businessHoursLoading && !businessHours ? (
                <div className={classNames(sharedStyles.card, sharedStyles.loadingState)}>
                    <span className={sharedStyles.loadingSpinner} />
                    <strong>Cargando horarios laborales...</strong>
                </div>
            ) : businessHoursError && !businessHours ? (
                <div className={classNames(sharedStyles.card, sharedStyles.errorState)}>
                    <strong>No pudimos cargar los horarios laborales</strong>
                    <span>{businessHoursError}</span>
                    <button
                        className={classNames(sharedStyles.button, sharedStyles.buttonPrimary)}
                        onClick={() => void loadBusinessHours()}
                        type="button"
                    >
                        Reintentar
                    </button>
                </div>
            ) : businessHours ? (
                <BusinessHoursForm
                    initialValues={businessHours}
                    onSubmit={handleBusinessHoursUpdate}
                />
            ) : null}
        </section>
    );
}
