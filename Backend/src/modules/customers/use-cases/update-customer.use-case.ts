import { customerRepository } from "../repositories";
import { UpdateCustomerDto, Customer } from "../types";
import { NotFoundError, ConflictError } from "../../../shared/errors";
import {
  isUniqueViolationError,
  normalizePhone,
} from "../utils/phone.utils";

export class UpdateCustomerUseCase {
  async execute(id: string, dto: UpdateCustomerDto): Promise<Customer> {
    const existing = await customerRepository.findById(id);

    if (!existing) {
      throw new NotFoundError("Customer not found");
    }

    const phone =
      dto.phone === undefined ? undefined : normalizePhone(dto.phone);

    if (phone) {
      const phoneOwner = await customerRepository.findByPhone(phone);

      if (phoneOwner && phoneOwner.id !== id) {
        throw new ConflictError("A customer with this phone already exists");
      }
    }

    try {
      return await customerRepository.update(id, {
        full_name: dto.full_name,
        phone,
        email: dto.email === undefined ? undefined : dto.email,
      });
    } catch (error: unknown) {
      if (isUniqueViolationError(error)) {
        throw new ConflictError("A customer with this phone already exists");
      }

      throw error;
    }
  }
}
