# SDD — MVP Barbería Unipersonal

**Proyecto:** BarberShop  
**Versión:** 1.0 MVP  
**Estado:** Prioridad actual  
**Objetivo:** Simplificar el sistema actual para una barbería de una sola persona.

---

# 1. Objetivo del cambio

El sistema venía pensado para múltiples barberos, clientes con login, roles complejos, disponibilidad avanzada, pagos y dashboard.

Para esta primera versión se reduce el alcance a un MVP funcional para una barbería unipersonal.

El sistema debe permitir:

- Login del dueño/barbero.
- Gestión de servicios.
- Reserva pública de turnos sin registro.
- Gestión interna de turnos.
- Registro simple de clientes sin Supabase Auth.

---

# 2. Alcance actual

## Incluido en el MVP

- Login del admin/dueño.
- CRUD de servicios.
- Creación de clientes sin login.
- Reserva pública de turnos.
- Listado de turnos.
- Confirmar turno.
- Cancelar turno.
- Completar turno.
- Marcar turno como ausente.
- Validación de superposición de turnos.
- Cálculo de duración usando `duration_minutes + buffer_minutes`.

## Fuera del MVP

No implementar todavía:

- Múltiples barberos.
- Registro público de usuarios.
- Clientes con login.
- Rol `barber`.
- Rol `customer` como usuario autenticado.
- Pagos.
- Notificaciones.
- Dashboard avanzado.
- Múltiples sucursales.
- Horarios laborales complejos por barbero.
- Disponibilidad avanzada por barbero.

---

# 3. Login

El login es únicamente para el dueño/barbero.

El usuario administrador ya existe en Supabase Auth y en la tabla `profiles`.

Endpoint:

```http
POST /api/auth/login
```

El backend debe autenticar contra Supabase Auth.

No implementar:

```http
POST /api/auth/register
```

No permitir registro público de usuarios en esta etapa.

---

# 4. Roles

Mantener la columna `role` en `profiles`, pero para este MVP usar solamente:

```txt
admin
```

El rol `admin` representa al dueño/barbero único.

Los endpoints privados deben estar protegidos con:

```ts
authenticate
requireRole("admin")
```

---

# 5. Clientes

Los clientes no deben iniciar sesión.

Los clientes no deben existir en Supabase Auth.

Crear tabla `customers`, ya que actualmente no existe.

Campos sugeridos:

```txt
id uuid primary key
full_name text not null
phone varchar not null
email text null
created_at timestamptz default now()
updated_at timestamptz
```

Reglas:

- El teléfono debe ser el identificador principal para reutilizar clientes.
- Si un cliente reserva nuevamente con el mismo teléfono, reutilizar el registro existente.
- El email es opcional.

---

# 6. Servicios

Mantener la tabla `services` actual.

No recrear la tabla.

No modificar columnas existentes salvo que sea estrictamente necesario.

Campos actuales a respetar:

```txt
id
name
description
duration_minutes
buffer_minutes
price
is_active
created_at
```

El admin puede:

- Crear servicio.
- Listar servicios.
- Editar servicio.
- Activar/desactivar servicio.

Los servicios inactivos no deben poder usarse para nuevas reservas.

---

# 7. Turnos

Mantener o crear la tabla `appointments`, adaptada al MVP unipersonal.

Un turno pertenece a:

- Un cliente.
- Un servicio.

Para este MVP no se requiere seleccionar barbero porque existe una sola persona.

Si la tabla actual ya tiene `barber_id`, no eliminarlo obligatoriamente. Puede quedar nullable o asignarse internamente al único admin/barbero, pero no debe ser requerido desde el frontend público.

Campos mínimos:

```txt
id uuid primary key
customer_id uuid not null
service_id uuid not null
appointment_date date not null
start_time time not null
end_time time not null
status text not null
notes text null
created_at timestamptz default now()
updated_at timestamptz
```

Relaciones:

```txt
customer_id -> customers.id
service_id -> services.id
```

Estados permitidos:

```txt
pending
confirmed
completed
cancelled
no_show
```

---

# 8. Reserva pública

Crear endpoint público:

```http
POST /api/appointments/public
```

No requiere login.

Body:

```json
{
  "full_name": "Juan Pérez",
  "phone": "2915551234",
  "email": "juan@email.com",
  "service_id": "uuid-service",
  "appointment_date": "2026-06-15",
  "start_time": "10:00",
  "notes": "Opcional"
}
```

El backend debe:

1. Validar datos.
2. Validar que el servicio exista.
3. Validar que el servicio esté activo.
4. Calcular `end_time` usando `duration_minutes + buffer_minutes`.
5. Validar que la fecha y hora no sean pasadas.
6. Validar que no exista superposición con turnos activos.
7. Crear o reutilizar customer por teléfono.
8. Crear turno con estado `pending`.
9. Devolver confirmación.

Estados que bloquean horario:

```txt
pending
confirmed
```

Estados que no bloquean horario:

```txt
cancelled
completed
no_show
```

---

# 9. Panel privado del admin

Endpoints privados:

```http
GET /api/appointments
GET /api/appointments/:id
PATCH /api/appointments/:id/confirm
PATCH /api/appointments/:id/cancel
PATCH /api/appointments/:id/complete
PATCH /api/appointments/:id/no-show
```

Todos deben requerir:

```ts
authenticate
requireRole("admin")
```

---

# 10. Disponibilidad

Para el MVP, la disponibilidad debe calcularse de forma simple.

Endpoint:

```http
GET /api/available-slots
```

Query params:

```txt
serviceId
date
```

No usar `barberId` como parámetro obligatorio.

El backend debe calcular horarios disponibles usando:

- Duración del servicio.
- Buffer del servicio.
- Turnos existentes.
- Horario laboral simple definido por configuración interna o constante temporal.

Ejemplo temporal aceptado para MVP:

```txt
Lunes a sábado
09:00 a 18:00
```

Más adelante se podrá crear una tabla de horarios laborales configurable.

---

# 11. Seguridad

Endpoint público:

```http
POST /api/appointments/public
GET /api/services
GET /api/available-slots
```

Endpoints privados:

```http
POST /api/services
PUT /api/services/:id
PATCH /api/services/:id/status
GET /api/appointments
GET /api/appointments/:id
PATCH /api/appointments/:id/confirm
PATCH /api/appointments/:id/cancel
PATCH /api/appointments/:id/complete
PATCH /api/appointments/:id/no-show
```

Los privados deben requerir:

```ts
authenticate
requireRole("admin")
```

---

# 12. Arquitectura

Mantener la estructura modular ya implementada si existe.

Estructura sugerida:

```txt
src/
├── config/
├── middlewares/
├── modules/
│   ├── auth/
│   ├── profiles/
│   ├── services/
│   ├── customers/
│   └── appointments/
├── shared/
├── app.ts
└── server.ts
```

No crear módulos grandes innecesarios para este MVP.

---

# 13. Criterios de aceptación

- El admin existente puede iniciar sesión.
- El admin puede gestionar servicios.
- Un cliente puede reservar turno sin registrarse.
- Se crea o reutiliza un customer por teléfono.
- El sistema evita superposición de turnos.
- Los turnos se crean como `pending`.
- El admin puede confirmar, cancelar, completar o marcar ausente.
- Los clientes no existen en Supabase Auth.
- No se implementan múltiples barberos.
- No se implementa registro público de usuarios.
