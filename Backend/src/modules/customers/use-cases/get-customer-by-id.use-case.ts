import { customerRepository } from "../repositories";
import { Customer } from "../types";
import { NotFoundError } from "../../../shared/errors";

export class GetCustomerByIdUseCase {
  async execute(id: string): Promise<Customer> {
    const customer = await customerRepository.findById(id);

    if (!customer) {
      throw new NotFoundError("Customer not found");
    }

    return customer;
  }
}