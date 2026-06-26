import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
    serviceSchema,
    type ServiceFormData,
} from "../../schemas/serviceSchema";
import { classNames } from "../../utils/classNames";
import sharedStyles from "../ui/styles/shared.module.css";

interface Props {
    initialValues?: Partial<ServiceFormData>;
    submitText: string;
    onSubmit: (data: ServiceFormData) => Promise<void>;
    onCancel?: () => void;
}

export function ServicesForm({
    initialValues,
    submitText,
    onSubmit,
    onCancel,
}: Props) {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ServiceFormData>({
        resolver: zodResolver(serviceSchema),
        defaultValues: {
            name: initialValues?.name ?? "",
            description: initialValues?.description ?? "",
            price: initialValues?.price,
            duration_minutes: initialValues?.duration_minutes,
        },
    });

    return (
        <form className={classNames(sharedStyles.card, sharedStyles.formCard)} onSubmit={handleSubmit(onSubmit)}>
            <div className={sharedStyles.cardBody}>
                <div className={sharedStyles.formGrid}>
                    <div className={sharedStyles.formField}>
                        <label htmlFor="name">Nombre</label>
                        <input
                            id="name"
                            type="text"
                            placeholder="Ej. Corte clásico"
                            {...register("name")}
                        />
                        {errors.name && <span className={sharedStyles.formError}>{errors.name.message}</span>}
                    </div>

                    <div className={sharedStyles.formField}>
                        <label htmlFor="price">Precio</label>
                        <input
                            id="price"
                            type="number"
                            placeholder="0"
                            {...register("price", {
                                setValueAs: (value) => (value === "" ? undefined : Number(value)),
                            })}
                        />
                        {errors.price && <span className={sharedStyles.formError}>{errors.price.message}</span>}
                    </div>

                    <div className={sharedStyles.formField}>
                        <label htmlFor="duration_minutes">Duración aproximada</label>
                        <input
                            id="duration_minutes"
                            type="number"
                            placeholder="45"
                            {...register("duration_minutes", {
                                setValueAs: (value) => (value === "" ? undefined : Number(value)),
                            })}
                        />
                        <span className={sharedStyles.formHint}>El buffer se aplica automáticamente desde Supabase.</span>
                        {errors.duration_minutes && (
                            <span className={sharedStyles.formError}>{errors.duration_minutes.message}</span>
                        )}
                    </div>

                    <div className={classNames(sharedStyles.formField, sharedStyles.formFieldWide)}>
                        <label htmlFor="description">Descripción</label>
                        <textarea
                            id="description"
                            placeholder="Detalle breve del servicio"
                            {...register("description")}
                        />
                        {errors.description && (
                            <span className={sharedStyles.formError}>{errors.description.message}</span>
                        )}
                    </div>
                </div>

                <div className={sharedStyles.formActions}>
                    {onCancel && (
                        <button
                            className={classNames(sharedStyles.button, sharedStyles.buttonSecondary)}
                            disabled={isSubmitting}
                            onClick={onCancel}
                            type="button"
                        >
                            Cancelar
                        </button>
                    )}
                    <button className={classNames(sharedStyles.button, sharedStyles.buttonPrimary)} disabled={isSubmitting} type="submit">
                        {isSubmitting ? "Guardando…" : submitText}
                    </button>
                </div>
            </div>
        </form>
    );
}
