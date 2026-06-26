import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
    customerSchema,
    type CustomerFormData,
} from "../../schemas/customerSchema";
import { classNames } from "../../utils/classNames";
import {
    DEFAULT_PHONE_COUNTRY_CODE,
    buildInternationalPhone,
    keepDigitsOnly,
    phoneCountryOptions,
    splitInternationalPhone,
    type PhoneCountryCode,
} from "../../utils/phoneInput";
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
    const initialPhoneParts = splitInternationalPhone(initialValues?.phone ?? "");
    const [phoneCountryCode, setPhoneCountryCode] = useState<PhoneCountryCode>(
        initialPhoneParts.countryCode || DEFAULT_PHONE_COUNTRY_CODE
    );
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<CustomerFormData>({
        resolver: zodResolver(customerSchema),
        defaultValues: {
            full_name: initialValues?.full_name ?? "",
            phone: initialPhoneParts.nationalNumber,
            email: initialValues?.email ?? "",
        },
    });

    const handleCustomerSubmit = async (data: CustomerFormData) => {
        await onSubmit({
            ...data,
            phone: buildInternationalPhone(phoneCountryCode, data.phone),
        });
    };

    return (
        <form className={classNames(sharedStyles.card, sharedStyles.formCard)} onSubmit={handleSubmit(handleCustomerSubmit)}>
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
                        <div className={sharedStyles.phoneInput}>
                            <select
                                aria-label="Código de país"
                                value={phoneCountryCode}
                                onChange={(event) =>
                                    setPhoneCountryCode(event.target.value as PhoneCountryCode)
                                }
                            >
                                {phoneCountryOptions.map((option) => (
                                    <option key={option.code} value={option.code}>
                                        {option.code} {option.label}
                                    </option>
                                ))}
                            </select>
                            <input
                                id="phone"
                                inputMode="numeric"
                                maxLength={15}
                                pattern="[0-9]*"
                                type="tel"
                                placeholder="2915551234"
                                {...register("phone", { onChange: keepDigitsOnly })}
                            />
                        </div>
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
