export const BUSINESS_TIME_ZONE =
    import.meta.env.VITE_APP_TIMEZONE ??
    "America/Argentina/Buenos_Aires";

export function getBusinessDate(
    instant = new Date(),
    timeZone = BUSINESS_TIME_ZONE
): string {
    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).formatToParts(instant);

    const year = parts.find((part) => part.type === "year")?.value ?? "";
    const month = parts.find((part) => part.type === "month")?.value ?? "";
    const day = parts.find((part) => part.type === "day")?.value ?? "";

    return `${year}-${month}-${day}`;
}
