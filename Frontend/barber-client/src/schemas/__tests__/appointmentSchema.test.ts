import { describe, expect, it } from "vitest";
import { appointmentSchema } from "../appointmentSchema";

const schedule = {
    service_id: "11111111-1111-4111-8111-111111111111",
    appointment_date: "2030-07-01",
    start_time: "10:00",
    notes: "",
};

describe("appointmentSchema", () => {
    it("requires a valid selected customer in existing mode", () => {
        expect(
            appointmentSchema.safeParse({
                ...schedule,
                customer_mode: "existing",
                customer_id: "",
            }).success
        ).toBe(false);

        expect(
            appointmentSchema.safeParse({
                ...schedule,
                customer_mode: "existing",
                customer_id: "22222222-2222-4222-8222-222222222222",
            }).success
        ).toBe(true);
    });

    it("requires name and phone in new customer mode", () => {
        expect(
            appointmentSchema.safeParse({
                ...schedule,
                customer_mode: "new",
                full_name: "",
                phone: "123",
                email: "",
            }).success
        ).toBe(false);

        expect(
            appointmentSchema.safeParse({
                ...schedule,
                customer_mode: "new",
                full_name: "Ana Pérez",
                phone: "2915551234",
                email: "",
            }).success
        ).toBe(true);

        expect(
            appointmentSchema.safeParse({
                ...schedule,
                customer_mode: "new",
                full_name: "Ana Pérez",
                phone: "291ABC1234",
                email: "",
            }).success
        ).toBe(false);
    });
});
