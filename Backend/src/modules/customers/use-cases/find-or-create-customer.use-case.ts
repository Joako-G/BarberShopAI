import { customerRepository } from "../repositories";
import { CreateCustomerDto, Customer } from "../types";
import {
  isUniqueViolationError,
  normalizePhone,
} from "../utils/phone.utils";

export class FindOrCreateCustomerUseCase {
  async execute(dto: CreateCustomerDto): Promise<Customer> {
    const phone = normalizePhone(dto.phone);
    const existing = await customerRepository.findByPhone(phone);

    if (existing) {
      return existing;
    }

    try {
      return await customerRepository.insert({
        full_name: dto.full_name,
        phone,
        email: dto.email ?? null,
      });
    } catch (error: unknown) {
      if (!isUniqueViolationError(error)) {
        throw error;
      }

      const customerCreatedByConcurrentRequest =
        await customerRepository.findByPhone(phone);

      if (customerCreatedByConcurrentRequest) {
        return customerCreatedByConcurrentRequest;
      }

      throw error;
    }
  }
}
