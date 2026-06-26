import type { Service } from "../../types/service";
import { classNames } from "../../utils/classNames";
import sharedStyles from "../ui/styles/shared.module.css";

interface Props {
    services: Service[];
    handleToggleService: (id: string, isActive: boolean, serviceName: string) => void;
    handleEditService: (id: string) => void;
}

export function ServicesTable({
    services,
    handleToggleService,
    handleEditService,
}: Props) {
    return (
        <div className={sharedStyles.tableShell}>
            <table className={sharedStyles.dataTable}>
                <thead>
                    <tr>
                        <th>Servicio</th>
                        <th>Precio</th>
                        <th>Duración</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {services.map((service) => (
                        <tr key={service.id}>
                            <td data-label="Servicio">
                                <span className={sharedStyles.tablePrimary}>{service.name}</span>
                                <span className={sharedStyles.tableSecondary}>{service.description || "Sin descripción"}</span>
                            </td>
                            <td data-label="Precio">${service.price}</td>
                            <td data-label="Duración">
                                {service.duration_minutes} min
                                <span className={sharedStyles.tableSecondary}>+ {service.buffer_minutes} min de margen</span>
                            </td>
                            <td data-label="Estado">
                                <span className={classNames(sharedStyles.statusChip, service.is_active ? sharedStyles.statusSuccess : sharedStyles.statusError)}>
                                    {service.is_active ? "Activo" : "Inactivo"}
                                </span>
                            </td>
                            <td data-label="Acciones">
                                <div className={sharedStyles.tableActions}>
                                    <button
                                        className={classNames(sharedStyles.button, sharedStyles.buttonSecondary, sharedStyles.buttonQuiet)}
                                        onClick={() => handleEditService(service.id)}
                                        type="button"
                                    >
                                        Editar
                                    </button>
                                    <button
                                        className={classNames(sharedStyles.button, sharedStyles.buttonQuiet, service.is_active ? sharedStyles.buttonDanger : sharedStyles.buttonSecondary)}
                                        onClick={() =>
                                            handleToggleService(
                                                service.id,
                                                !service.is_active,
                                                service.name
                                            )
                                        }
                                        type="button"
                                    >
                                        {service.is_active ? "Desactivar" : "Activar"}
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
