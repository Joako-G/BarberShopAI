# BUSINESS_RULES — MVP Barbería Unipersonal

## Objetivo

Definir las reglas de negocio para una barbería de una sola persona.

---

# Reglas de autenticación

- Solo el dueño/barbero inicia sesión.
- El usuario admin ya existe en Supabase Auth y en `profiles`.
- No existe registro público de usuarios en el MVP.
- Los clientes no tienen login.
- Los clientes no existen en Supabase Auth.

---

# Reglas de roles

Para el MVP se usa solamente:

```txt
admin
```

El rol `admin` representa al dueño/barbero único.

Los roles `barber` y `customer` pueden quedar documentados para futuras versiones, pero no deben implementarse ahora.

---

# Reglas de clientes

- Los clientes se guardan en una tabla `customers`.
- Los clientes no son usuarios autenticados.
- El teléfono es el dato principal para identificar o reutilizar un cliente.
- El teléfono se normaliza y persiste usando únicamente dígitos.
- El teléfono debe contener entre 7 y 20 dígitos.
- Dos clientes no pueden compartir el mismo teléfono.
- El email es opcional.
- Si un cliente confirmado reserva nuevamente con el mismo teléfono, se debe reutilizar el customer existente.
- En la reserva pública el customer no se crea inmediatamente; los datos quedan en el turno como solicitante temporal hasta que el admin confirme.
- En el MVP no se recomienda eliminar clientes físicamente. Si se necesita
  ocultarlos más adelante, agregar una columna `deleted_at` o `is_active` y
  aplicar borrado lógico para no romper el historial de turnos.

---

# Reglas de servicios

Cada servicio tiene:

- name
- description
- duration_minutes
- buffer_minutes
- price
- is_active

Los servicios inactivos no se pueden usar para crear nuevos turnos.

---

# Duración del turno

El tiempo total ocupado por un turno se calcula así:

```txt
duration_minutes + buffer_minutes
```

Ejemplo:

```txt
Corte: 45 minutos
Buffer: 15 minutos
Total ocupado: 60 minutos
```

---

# Reglas de turnos

Un turno pertenece a:

- Un customer.
- Un service.

No se requiere seleccionar barbero porque la barbería es unipersonal.

Si existe `barber_id` en la tabla actual, no debe ser requerido en el flujo público del MVP.

El admin puede crear turnos desde el panel:

- Seleccionando un customer existente.
- Ingresando los datos de un customer nuevo.

Cuando ingresa un customer nuevo, el teléfono se usa para reutilizar un registro
existente antes de crear uno nuevo.

Los turnos creados por el admin comienzan en:

```txt
confirmed
```

Los turnos creados desde la reserva pública comienzan en:

```txt
pending
```

Estos turnos pueden tener `customer_id` nulo y datos temporales del solicitante.
Al confirmar, el sistema crea o reutiliza el customer por teléfono.

El admin puede editar únicamente:

- service_id
- appointment_date
- start_time
- notes

No se puede editar el customer ni el estado desde el formulario.

Los turnos en estados finales no se pueden editar:

```txt
completed
cancelled
no_show
```

---

# Estados de turno

Estados permitidos:

```txt
pending
confirmed
completed
cancelled
no_show
```

---

# Estados que bloquean horario

Estos estados ocupan horario:

```txt
pending
confirmed
```

---

# Estados que no bloquean horario

Estos estados no deben bloquear nuevas reservas:

```txt
cancelled
completed
no_show
```

Las transiciones de estado se validan y actualizan atómicamente en PostgreSQL.
Dos acciones simultáneas sobre el mismo turno no pueden sobrescribirse.

---

# Regla de superposición

No permitir turnos superpuestos.

Fórmula:

```txt
existing.start_time < new.end_time
AND
existing.end_time > new.start_time
```

Si la condición se cumple, el nuevo turno no debe crearse.

La misma validación se aplica al crear turnos públicos, crear turnos
administrativos y editar turnos. En edición se ignora el turno actual.

Si el horario ya no está disponible, la API responde:

```txt
409 Conflict
El horario seleccionado ya no está disponible.
```

La validación definitiva se ejecuta en PostgreSQL dentro de la misma
transacción que crea o edita el turno. Las operaciones de una misma fecha se
serializan con un advisory lock para impedir que dos solicitudes simultáneas
ocupen el mismo horario.

La reserva pública se crea en una transacción sin crear customer. La creación o
reutilización del customer se ejecuta atómicamente al confirmar el turno.

---

# Reglas de fecha y hora

La fecha y hora comercial del MVP se interpreta siempre en:

```txt
America/Argentina/Buenos_Aires
```

El backend usa `APP_TIMEZONE` y el frontend `VITE_APP_TIMEZONE`. Ambos valores
deben coincidir.

No permitir reservas:

- En fechas pasadas.
- En horarios pasados del día actual.
- Con servicios inexistentes.
- Con servicios inactivos.

---

# Disponibilidad

Para el MVP, la disponibilidad se calcula dinámicamente.

No guardar disponibilidad como slots.

La disponibilidad se calcula usando:

- Horario laboral simple.
- Duración del servicio.
- Buffer del servicio.
- Turnos existentes.

Horario laboral temporal aceptado para MVP:

```txt
Lunes a sábado
09:00 a 18:00
```

---

# Integridad histórica

- Los turnos completados no deben eliminarse.
- Los turnos cancelados tampoco deberían eliminarse físicamente.
- Se debe cambiar el estado del turno en lugar de borrar registros históricos.
- Los servicios no deben eliminarse desde la API del MVP; deben activarse o
  desactivarse con `is_active`.
- Los clientes vinculados a turnos deben conservarse para mantener trazabilidad.

---

# Reglas fuera del MVP

No implementar todavía:

- Pagos.
- Notificaciones.
- Clientes con login.
- Múltiples barberos.
- Dashboard avanzado.
- Múltiples sucursales.
