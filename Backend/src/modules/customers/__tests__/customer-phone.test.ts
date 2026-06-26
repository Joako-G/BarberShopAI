import { beforeEach, describe, expect, it, vi } from "vitest";
import { ConflictError } from "../../../shared/errors";
import { customerRepository } from "../repositories";
import { createCustomerSchema, updateCustomerSchema } from "../types";
import { FindOrCreateCustomerUseCase } from "../use-cases/find-or-create-customer.use-case";
import { UpdateCustomerUseCase } from "../use-cases/update-customer.use-case";
import {
  isUniqueViolationError,
  normalizePhone,
} from "../utils/phone.utils";

const customer = {
  id: "22222222-2222-4222-8222-222222222222",
  full_name: "Juan Perez",
  phone: "542915551234",
  email: null,
  created_at: "",
  updated_at: null,
};

describe("customer phone handling", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("normalizes customer phones in schemas and utilities", () => {
    expect(normalizePhone("+54 291 555-1234")).toBe("542915551234");
    expect(
      createCustomerSchema.parse({
        full_name: "Juan Perez",
        phone: "+54 291 555-1234",
      }).phone
    ).toBe("542915551234");
    expect(
      updateCustomerSchema.parse({ phone: "(291) 555-1234" }).phone
    ).toBe("2915551234");
  });

  it("recognizes PostgreSQL unique violations without using any", () => {
    expect(isUniqueViolationError({ code: "23505" })).toBe(true);
    expect(isUniqueViolationError({ code: "PGRST116" })).toBe(false);
    expect(isUniqueViolationError(null)).toBe(false);
  });

  it("reuses the customer created by a concurrent request after a 23505", async () => {
    vi.spyOn(customerRepository, "findByPhone")
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(customer);
    vi.spyOn(customerRepository, "insert").mockRejectedValue({
      code: "23505",
    });

    const result = await new FindOrCreateCustomerUseCase().execute({
      full_name: customer.full_name,
      phone: "+54 291 555-1234",
      email: null,
    });

    expect(result).toEqual(customer);
    expect(customerRepository.findByPhone).toHaveBeenNthCalledWith(
      1,
      customer.phone
    );
    expect(customerRepository.findByPhone).toHaveBeenNthCalledWith(
      2,
      customer.phone
    );
  });

  it("does not hide database errors unrelated to uniqueness", async () => {
    const databaseError = { code: "XX000" };
    vi.spyOn(customerRepository, "findByPhone").mockResolvedValue(null);
    vi.spyOn(customerRepository, "insert").mockRejectedValue(databaseError);

    await expect(
      new FindOrCreateCustomerUseCase().execute({
        full_name: customer.full_name,
        phone: customer.phone,
        email: null,
      })
    ).rejects.toBe(databaseError);
  });

  it("returns a 409 when an update collides with the unique constraint", async () => {
    vi.spyOn(customerRepository, "findById").mockResolvedValue(customer);
    vi.spyOn(customerRepository, "findByPhone").mockResolvedValue(null);
    vi.spyOn(customerRepository, "update").mockRejectedValue({
      code: "23505",
    });

    const promise = new UpdateCustomerUseCase().execute(customer.id, {
      phone: "(291) 444-5566",
    });

    await expect(promise).rejects.toBeInstanceOf(ConflictError);
    await expect(promise).rejects.toMatchObject({ statusCode: 409 });
  });
});
