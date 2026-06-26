import type { Customer } from "../../types/customer";
import { classNames } from "../../utils/classNames";
import sharedStyles from "../ui/styles/shared.module.css";

interface Props {
    customers: Customer[];
    handleEditCustomer: (id: string) => void;
}

export function CustomerTable({ customers, handleEditCustomer }: Props) {
    return (
        <div className={sharedStyles.tableShell}>
            <table className={sharedStyles.dataTable}>
                <thead>
                    <tr>
                        <th>Cliente</th>
                        <th>Teléfono</th>
                        <th>Email</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {customers.map((customer) => (
                        <tr key={customer.id}>
                            <td data-label="Cliente">
                                <span className={sharedStyles.tablePrimary}>{customer.full_name}</span>
                                <span className={sharedStyles.tableSecondary}>Cliente registrado</span>
                            </td>
                            <td data-label="Teléfono">{customer.phone}</td>
                            <td data-label="Email">{customer.email || "Sin email"}</td>
                            <td data-label="Acciones">
                                <div className={sharedStyles.tableActions}>
                                    <button
                                        className={classNames(sharedStyles.button, sharedStyles.buttonSecondary, sharedStyles.buttonQuiet)}
                                        onClick={() => handleEditCustomer(customer.id)}
                                        type="button"
                                    >
                                        Editar
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
