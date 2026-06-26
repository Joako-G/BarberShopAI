import { CreateCustomerDto, Customer } from "../types";
import { FindOrCreateCustomerUseCase } from "./find-or-create-customer.use-case";

export class CreateCustomerUseCase {
  async execute(dto: CreateCustomerDto): Promise<Customer> {
    return new FindOrCreateCustomerUseCase().execute(dto);
  }
}
