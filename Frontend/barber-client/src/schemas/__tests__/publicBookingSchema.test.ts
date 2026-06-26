import { describe, expect, it } from "vitest";
import { publicBookingSchema } from "../publicBookingSchema";

const validBooking = {
    full_name: "Juan Pérez",
    phone: "2915551234",
    email: "",
    service_id: "11111111-1111-4111-8111-111111111111",
    appointment_date: "2030-07-01",
    start_time: "10:00",
    notes: "",
};

describe("publicBookingSchema", () => {
    it("accepts a valid booking without email", () => {
        expect(publicBookingSchema.safeParse(validBooking).success).toBe(true);
    });

    it("rejects missing customer and schedule data", () => {
        const result = publicBookingSchema.safeParse({
            ...validBooking,
            full_name: "",
            phone: "123",
            service_id: "",
            start_time: "",
        });

        expect(result.success).toBe(false);
    });

    it("accepts formatted phone numbers and rejects invalid email", () => {
        expect(
            publicBookingSchema.safeParse({
                ...validBooking,
                phone: "+54 291 555-1234",
            }).success
        ).toBe(true);

        expect(
            publicBookingSchema.safeParse({
                ...validBooking,
                email: "not-an-email",
            }).success
        ).toBe(false);
    });

    it("rejects notes longer than 500 characters", () => {
        expect(
            publicBookingSchema.safeParse({
                ...validBooking,
                notes: "a".repeat(501),
            }).success
        ).toBe(false);
    });
});
