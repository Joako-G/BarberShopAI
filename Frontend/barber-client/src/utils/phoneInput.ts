export const phoneCountryOptions = [
    { code: "+54", label: "Argentina" },
    { code: "+55", label: "Brasil" },
    { code: "+56", label: "Chile" },
    { code: "+598", label: "Uruguay" },
    { code: "+595", label: "Paraguay" },
    { code: "+591", label: "Bolivia" },
    { code: "+51", label: "Perú" },
    { code: "+57", label: "Colombia" },
    { code: "+58", label: "Venezuela" },
    { code: "+593", label: "Ecuador" },
    { code: "+52", label: "México" },
    { code: "+1", label: "EE.UU./Canadá" },
    { code: "+34", label: "España" },
] as const;

export type PhoneCountryCode = (typeof phoneCountryOptions)[number]["code"];

export const DEFAULT_PHONE_COUNTRY_CODE: PhoneCountryCode = "+54";

export function sanitizePhoneInput(value: string): string {
    return value.replace(/\D/g, "").slice(0, 15);
}

export function keepDigitsOnly(event: { currentTarget: HTMLInputElement }): void {
    event.currentTarget.value = sanitizePhoneInput(event.currentTarget.value);
}

export function buildInternationalPhone(
    countryCode: PhoneCountryCode,
    phone: string
): string {
    return `${countryCode.replace(/\D/g, "")}${sanitizePhoneInput(phone)}`;
}

export function splitInternationalPhone(phone: string): {
    countryCode: PhoneCountryCode;
    nationalNumber: string;
} {
    const digits = phone.replace(/\D/g, "");
    const matchingOption = [...phoneCountryOptions]
        .sort((a, b) => b.code.length - a.code.length)
        .find((option) => digits.startsWith(option.code.replace(/\D/g, "")));

    if (!matchingOption) {
        return {
            countryCode: DEFAULT_PHONE_COUNTRY_CODE,
            nationalNumber: digits,
        };
    }

    return {
        countryCode: matchingOption.code,
        nationalNumber: digits.slice(matchingOption.code.replace(/\D/g, "").length),
    };
}
