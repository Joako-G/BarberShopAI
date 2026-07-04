import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppearanceSettingsForm } from "../components/settings/AppearanceSettingsForm";
import { AppointmentSettingsForm } from "../components/settings/AppointmentSettingsForm";
import { BusinessHoursForm } from "../components/settings/BusinessHoursForm";
import { CalendarExceptionsManager } from "../components/settings/CalendarExceptionsManager";
import { GeneralSettingsForm } from "../components/settings/GeneralSettingsForm";
import sharedStyles from "../components/ui/styles/shared.module.css";
import type {
    AppearanceSettingsFormData,
    AppointmentSettingsFormData,
    BusinessHoursFormData,
    CalendarExceptionFormData,
    SettingsFormData,
} from "../schemas/settingsSchema";
import { notifyError, notifySuccess } from "../services/notifications";
import {
    getAppointmentSettings,
    getAppearanceSettings,
    getBusinessHours,
    getCalendarExceptions,
    createCalendarException,
    deleteCalendarException,
    updateAppointmentSettings,
    updateAppearanceSettings,
    updateBusinessHours,
    updateCalendarException,
    updateGeneralSettings,
} from "../services/settingsApi";
import { useAppearanceStore } from "../store/appearanceStore";
import { useSettingsStore } from "../store/settingsStore";
import type {
    AppearanceSettings,
    AppointmentSettings,
    BusinessHour,
    CalendarException,
} from "../types/settings";
import { classNames } from "../utils/classNames";

type SettingsTab =
    | "general"
    | "business-hours"
    | "appointments"
    | "appearance"
    | "calendar";

const settingsTabs: Array<{ id: SettingsTab; label: string }> = [
    { id: "general", label: "Configuracion general" },
    { id: "business-hours", label: "Horarios laborales" },
    { id: "appointments", label: "Turnos" },
    { id: "appearance", label: "Apariencia" },
    { id: "calendar", label: "Calendario" },
];

export function SettingsPage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<SettingsTab>("general");
    const settings = useSettingsStore((state) => state.settings);
    const loading = useSettingsStore((state) => state.loading);
    const error = useSettingsStore((state) => state.error);
    const loadSettings = useSettingsStore((state) => state.loadSettings);
    const setSettings = useSettingsStore((state) => state.setSettings);
    const setAppearanceStoreSettings = useAppearanceStore(
        (state) => state.setAppearanceSettings
    );
    const [businessHours, setBusinessHours] = useState<BusinessHour[] | null>(null);
    const [businessHoursLoading, setBusinessHoursLoading] = useState(false);
    const [businessHoursError, setBusinessHoursError] = useState<string | null>(null);
    const [appointmentSettings, setAppointmentSettings] =
        useState<AppointmentSettings | null>(null);
    const [appointmentSettingsLoading, setAppointmentSettingsLoading] = useState(false);
    const [appointmentSettingsError, setAppointmentSettingsError] =
        useState<string | null>(null);
    const [appearanceSettings, setAppearanceSettings] =
        useState<AppearanceSettings | null>(null);
    const [appearanceSettingsLoading, setAppearanceSettingsLoading] = useState(false);
    const [appearanceSettingsError, setAppearanceSettingsError] =
        useState<string | null>(null);
    const [calendarExceptions, setCalendarExceptions] = useState<CalendarException[] | null>(null);
    const [calendarLoading, setCalendarLoading] = useState(false);
    const [calendarError, setCalendarError] = useState<string | null>(null);

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

    const loadAppointmentSettings = useCallback(async () => {
        setAppointmentSettingsLoading(true);
        setAppointmentSettingsError(null);

        try {
            const settings = await getAppointmentSettings();
            setAppointmentSettings(settings);
        } catch {
            setAppointmentSettingsError("No se pudo cargar la configuracion de turnos.");
        } finally {
            setAppointmentSettingsLoading(false);
        }
    }, []);

    const loadAppearanceSettings = useCallback(async () => {
        setAppearanceSettingsLoading(true);
        setAppearanceSettingsError(null);

        try {
            const settings = await getAppearanceSettings();
            setAppearanceSettings(settings);
            setAppearanceStoreSettings(settings);
        } catch {
            setAppearanceSettingsError("No se pudo cargar la apariencia.");
        } finally {
            setAppearanceSettingsLoading(false);
        }
    }, [setAppearanceStoreSettings]);

    const loadCalendarExceptions = useCallback(async () => {
        setCalendarLoading(true);
        setCalendarError(null);

        try {
            setCalendarExceptions(await getCalendarExceptions());
        } catch {
            setCalendarError("No se pudo cargar el calendario.");
        } finally {
            setCalendarLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadSettings().catch(() => undefined);
        void loadBusinessHours();
        void loadAppointmentSettings();
        void loadAppearanceSettings();
        void loadCalendarExceptions();
    }, [
        loadAppearanceSettings,
        loadAppointmentSettings,
        loadBusinessHours,
        loadCalendarExceptions,
        loadSettings,
    ]);

    const handleUpdate = async (data: SettingsFormData) => {
        try {
            const response = await updateGeneralSettings(data);
            setSettings(response.settings);
            notifySuccess({
                title: "Configuracion actualizada",
                description: "Los datos generales se guardaron correctamente.",
            });
        } catch {
            notifyError({
                title: "No se pudo guardar la configuracion",
                description: "Revisa los datos e intenta nuevamente.",
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
                description: "Revisa los dias y horarios e intenta nuevamente.",
            });
        }
    };

    const handleAppointmentSettingsUpdate = async (data: AppointmentSettingsFormData) => {
        try {
            const response = await updateAppointmentSettings(data);
            setAppointmentSettings(response.settings);
            notifySuccess({
                title: "Turnos actualizados",
                description: "La configuracion de turnos se guardo correctamente.",
            });
        } catch {
            notifyError({
                title: "No se pudo guardar la configuracion de turnos",
                description: "Revisa los valores e intenta nuevamente.",
            });
        }
    };

    const handleAppearanceSettingsUpdate = async (data: AppearanceSettingsFormData) => {
        try {
            const response = await updateAppearanceSettings(data);
            setAppearanceSettings(response.settings);
            setAppearanceStoreSettings(response.settings);
            notifySuccess({
                title: "Apariencia actualizada",
                description: "Los colores del panel se guardaron correctamente.",
            });
        } catch {
            notifyError({
                title: "No se pudo guardar la apariencia",
                description: "Revisa los colores y el radio de bordes e intenta nuevamente.",
            });
        }
    };

    const handleCalendarCreate = async (data: CalendarExceptionFormData) => {
        try {
            const response = await createCalendarException(data);
            setCalendarExceptions((current) => [...(current ?? []), response.exception]);
            notifySuccess({
                title: "Excepcion creada",
                description: "La excepcion de calendario se guardo correctamente.",
            });
        } catch {
            notifyError({
                title: "No se pudo crear la excepcion",
                description: "Revisa los datos e intenta nuevamente.",
            });
        }
    };

    const handleCalendarUpdate = async (
        id: string,
        data: CalendarExceptionFormData
    ) => {
        try {
            const response = await updateCalendarException(id, data);
            setCalendarExceptions((current) =>
                (current ?? []).map((exception) =>
                    exception.id === id ? response.exception : exception
                )
            );
            notifySuccess({
                title: "Excepcion actualizada",
                description: "La excepcion de calendario se actualizo correctamente.",
            });
        } catch {
            notifyError({
                title: "No se pudo actualizar la excepcion",
                description: "Revisa los datos e intenta nuevamente.",
            });
        }
    };

    const handleCalendarDelete = async (id: string) => {
        try {
            await deleteCalendarException(id);
            setCalendarExceptions((current) =>
                (current ?? []).filter((exception) => exception.id !== id)
            );
            notifySuccess({
                title: "Excepcion eliminada",
                description: "La excepcion de calendario se elimino correctamente.",
            });
        } catch {
            notifyError({
                title: "No se pudo eliminar la excepcion",
                description: "Intenta nuevamente en unos segundos.",
            });
        }
    };

    return (
        <section className={sharedStyles.page}>
            <header className={sharedStyles.pageHeader}>
                <div>
                    <span className={sharedStyles.pageEyebrow}>Sistema</span>
                    <h1>Configuracion</h1>
                    <p>Personaliza los datos principales del negocio y del panel administrativo.</p>
                </div>
            </header>

            <div
                aria-label="Secciones de configuracion"
                className={sharedStyles.settingsTabs}
                role="tablist"
            >
                {settingsTabs.map((tab) => (
                    <button
                        aria-selected={activeTab === tab.id}
                        className={classNames(
                            sharedStyles.settingsTab,
                            activeTab === tab.id && sharedStyles.settingsTabActive
                        )}
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        role="tab"
                        type="button"
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div role="tabpanel">
                {activeTab === "general" && (
                    loading && !settings ? (
                        <div className={classNames(sharedStyles.card, sharedStyles.loadingState)}>
                            <span className={sharedStyles.loadingSpinner} />
                            <strong>Cargando configuracion...</strong>
                        </div>
                    ) : error && !settings ? (
                        <div className={classNames(sharedStyles.card, sharedStyles.errorState)}>
                            <strong>No pudimos cargar la configuracion</strong>
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
                            <strong>No hay configuracion disponible</strong>
                            <span>Intenta recargar la pagina.</span>
                        </div>
                    )
                )}

                {activeTab === "business-hours" && (
                    businessHoursLoading && !businessHours ? (
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
                    ) : null
                )}

                {activeTab === "appointments" && (
                    appointmentSettingsLoading && !appointmentSettings ? (
                        <div className={classNames(sharedStyles.card, sharedStyles.loadingState)}>
                            <span className={sharedStyles.loadingSpinner} />
                            <strong>Cargando configuracion de turnos...</strong>
                        </div>
                    ) : appointmentSettingsError && !appointmentSettings ? (
                        <div className={classNames(sharedStyles.card, sharedStyles.errorState)}>
                            <strong>No pudimos cargar la configuracion de turnos</strong>
                            <span>{appointmentSettingsError}</span>
                            <button
                                className={classNames(sharedStyles.button, sharedStyles.buttonPrimary)}
                                onClick={() => void loadAppointmentSettings()}
                                type="button"
                            >
                                Reintentar
                            </button>
                        </div>
                    ) : appointmentSettings ? (
                        <AppointmentSettingsForm
                            initialValues={appointmentSettings}
                            onSubmit={handleAppointmentSettingsUpdate}
                        />
                    ) : null
                )}

                {activeTab === "appearance" && (
                    appearanceSettingsLoading && !appearanceSettings ? (
                        <div className={classNames(sharedStyles.card, sharedStyles.loadingState)}>
                            <span className={sharedStyles.loadingSpinner} />
                            <strong>Cargando apariencia...</strong>
                        </div>
                    ) : appearanceSettingsError && !appearanceSettings ? (
                        <div className={classNames(sharedStyles.card, sharedStyles.errorState)}>
                            <strong>No pudimos cargar la apariencia</strong>
                            <span>{appearanceSettingsError}</span>
                            <button
                                className={classNames(sharedStyles.button, sharedStyles.buttonPrimary)}
                                onClick={() => void loadAppearanceSettings()}
                                type="button"
                            >
                                Reintentar
                            </button>
                        </div>
                    ) : appearanceSettings ? (
                        <AppearanceSettingsForm
                            initialValues={appearanceSettings}
                            onSubmit={handleAppearanceSettingsUpdate}
                        />
                    ) : null
                )}

                {activeTab === "calendar" && (
                    calendarLoading && !calendarExceptions ? (
                        <div className={classNames(sharedStyles.card, sharedStyles.loadingState)}>
                            <span className={sharedStyles.loadingSpinner} />
                            <strong>Cargando calendario...</strong>
                        </div>
                    ) : calendarError && !calendarExceptions ? (
                        <div className={classNames(sharedStyles.card, sharedStyles.errorState)}>
                            <strong>No pudimos cargar el calendario</strong>
                            <span>{calendarError}</span>
                            <button
                                className={classNames(sharedStyles.button, sharedStyles.buttonPrimary)}
                                onClick={() => void loadCalendarExceptions()}
                                type="button"
                            >
                                Reintentar
                            </button>
                        </div>
                    ) : calendarExceptions ? (
                        <CalendarExceptionsManager
                            exceptions={calendarExceptions}
                            onCreate={handleCalendarCreate}
                            onDelete={handleCalendarDelete}
                            onUpdate={handleCalendarUpdate}
                        />
                    ) : null
                )}
            </div>
        </section>
    );
}
