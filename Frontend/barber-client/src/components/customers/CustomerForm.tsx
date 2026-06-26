import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
    customerSchema,
    type CustomerFormData,
} from "../../schemas/customerSchema";
import { classNames } from "../../utils/classNames";
import sharedStyles from "../ui/styles/shared.module.css";

interface Props {
    initialValues?: Partial<CustomerFormData>;
    submitText: string;
    onSubmit: (data: CustomerFormData) => Promise<void>;
    onCancel?: () => void;
}

export function CustomerForm({
    initialValues,
    submitText,
    onSubmit,
    onCancel,
}: Props) {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<CustomerFormData>({
        resolver: zodResolver(customerSchema),
        defaultValues: {
            full_name: initialValues?.full_name ?? "",
            phone: initialValues?.phone ?? "",
            email: initialValues?.email ?? "",
        },
    });

    return (
        <form className={classNames(sharedStyles.card, sharedStyles.formCard)} onSubmit={handleSubmit(onSubmit)}>
            <div className={sharedStyles.cardBody}>
                <div className={sharedStyles.formGrid}>
                    <div className={classNames(sharedStyles.formField, sharedStyles.formFieldWide)}>
                        <label htmlFor="full_name">Nombre completo</label>
                        <input
                            id="full_name"
                            type="text"
                            placeholder="Ej. Juan Pérez"
                            {...register("full_name")}
                        />
                        {errors.full_name && (
                            <span className={sharedStyles.formError}>{errors.full_name.message}</span>
                        )}
                    </div>

                    <div className={sharedStyles.formField}>
                        <label htmlFor="phone">Teléfono</label>
                        <input
                            id="phone"
                            inputMode="tel"
                            type="text"
                            placeholder="2915551234"
                            {...register("phone")}
                        />
                        {errors.phone && (
                            <span className={sharedStyles.formError}>{errors.phone.message}</span>
                        )}
                    </div>

                    <div className={sharedStyles.formField}>
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            placeholder="cliente@email.com"
                            {...register("email")}
                        />
                        {errors.email && (
                            <span className={sharedStyles.formError}>{errors.email.message}</span>
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
                    <button
                        className={classNames(sharedStyles.button, sharedStyles.buttonPrimary)}
                        disabled={isSubmitting}
                        type="submit"
                    >
                        {isSubmitting ? "Guardando…" : submitText}
                    </button>
                </div>
            </div>
        </form>
    );
}
