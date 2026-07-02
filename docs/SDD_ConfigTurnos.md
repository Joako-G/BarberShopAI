# SDD — Configuración de Turnos

## Objetivo

Implementar una subsección dentro de **Configuración** para administrar reglas generales de los turnos.

El objetivo es que el sistema pueda adaptarse a distintos rubros sin modificar código.

Por ejemplo:

* Barbería
* Salón de uñas
* Pestañas
* Consultorios
* Talleres
* Servicios técnicos

---

## Alcance de esta fase

Implementar configuración para:

* Intervalo de generación de horarios disponibles.
* Buffer por defecto entre turnos.
* Anticipación mínima para reservar.
* Cantidad máxima de días hacia adelante para reservar.
* Confirmación automática o manual.
* Permitir o no turnos pendientes.

No implementar todavía:

* Colores del sistema.
* Mensajes personalizados.
* Redes sociales.
* Feriados.
* Días no laborales especiales.
* Pagos o señas.

---

## Tabla sugerida

Crear tabla `appointment_settings`.

```sql
id uuid primary key default gen_random_uuid(),
slot_interval_minutes int not null default 15,
default_buffer_minutes int not null default 15,
min_booking_notice_minutes int not null default 0,
max_booking_days_ahead int not null default 30,
auto_confirm_appointments boolean not null default false,
allow_pending_appointments boolean not null default true,
created_at timestamptz default now(),
updated_at timestamptz default now()
```

Debe existir un único registro de configuración de turnos.

---

## Descripción de campos

### `slot_interval_minutes`

Define cada cuánto se generan los horarios disponibles.

Ejemplos:

```txt
15 → 09:00, 09:15, 09:30
30 → 09:00, 09:30, 10:00
60 → 09:00, 10:00, 11:00
```

---

### `default_buffer_minutes`

Buffer por defecto entre turnos.

Ejemplo:

Si un servicio dura 30 minutos y el buffer es 15:

```txt
Turno real: 09:00 - 09:30
Bloqueo total: 09:00 - 09:45
```

Importante:

Si el servicio ya tiene `buffer_minutes`, usar el buffer del servicio.

Si el servicio no tiene buffer definido, usar `default_buffer_minutes`.

---

### `min_booking_notice_minutes`

Tiempo mínimo de anticipación para reservar.

Ejemplo:

Si son las 10:30 y el valor es `60`, el primer turno disponible debe ser después de las 11:30.

---

### `max_booking_days_ahead`

Cantidad máxima de días hacia adelante para reservar.

Ejemplo:

Si el valor es `30`, el cliente no puede reservar a más de 30 días desde la fecha actual.

---

### `auto_confirm_appointments`

Define si los turnos se crean automáticamente como confirmados.

```txt
true → confirmed
false → pending
```

---

### `allow_pending_appointments`

Define si el sistema permite turnos pendientes.

Regla:

* Si `allow_pending_appointments` es `true`, se permite crear turnos `pending`.
* Si `allow_pending_appointments` es `false`, los turnos deben crearse como `confirmed`.

---

## Reglas de prioridad

Para definir el estado inicial del turno:

```txt
Si auto_confirm_appointments = true:
  status = confirmed

Si auto_confirm_appointments = false y allow_pending_appointments = true:
  status = pending

Si auto_confirm_appointments = false y allow_pending_appointments = false:
  status = confirmed
```

---

## Backend

Crear o extender módulo:

```txt
src/features/settings
```

Archivos sugeridos:

```txt
appointmentSettings.routes.ts
appointmentSettings.controller.ts
appointmentSettings.service.ts
appointmentSettings.repository.ts
appointmentSettings.schemas.ts
appointmentSettings.types.ts
```

También puede integrarse al módulo `settings` existente si mantiene la arquitectura actual.

---

## Endpoints

### Obtener configuración de turnos

```http
GET /api/settings/appointments
```

Protegido para admin.

Respuesta esperada:

```json
{
  "id": "uuid",
  "slot_interval_minutes": 15,
  "default_buffer_minutes": 15,
  "min_booking_notice_minutes": 0,
  "max_booking_days_ahead": 30,
  "auto_confirm_appointments": false,
  "allow_pending_appointments": true
}
```

---

### Actualizar configuración de turnos

```http
PUT /api/settings/appointments
```

Protegido para admin.

Body esperado:

```json
{
  "slot_interval_minutes": 30,
  "default_buffer_minutes": 10,
  "min_booking_notice_minutes": 60,
  "max_booking_days_ahead": 15,
  "auto_confirm_appointments": false,
  "allow_pending_appointments": true
}
```

Respuesta esperada:

```json
{
  "message": "Configuración de turnos actualizada correctamente",
  "settings": {
    "id": "uuid",
    "slot_interval_minutes": 30,
    "default_buffer_minutes": 10,
    "min_booking_notice_minutes": 60,
    "max_booking_days_ahead": 15,
    "auto_confirm_appointments": false,
    "allow_pending_appointments": true
  }
}
```

---

## Validaciones backend

Usar Zod.

Reglas:

```txt
slot_interval_minutes:
- requerido
- valores permitidos: 5, 10, 15, 20, 30, 60

default_buffer_minutes:
- requerido
- mínimo 0
- máximo 120

min_booking_notice_minutes:
- requerido
- mínimo 0
- máximo 10080

max_booking_days_ahead:
- requerido
- mínimo 1
- máximo 365

auto_confirm_appointments:
- requerido
- boolean

allow_pending_appointments:
- requerido
- boolean
```

---

## Integración con available-slots

Modificar `available-slots` para que:

1. Obtenga la configuración de turnos.
2. Use `slot_interval_minutes` en lugar de una constante fija.
3. Use `default_buffer_minutes` si el servicio no tiene buffer propio.
4. Respete `min_booking_notice_minutes`.
5. Respete `max_booking_days_ahead`.
6. Mantenga la lógica de horarios laborales configurables.
7. Mantenga bloqueo por turnos `pending` y `confirmed`.
8. Mantenga validación de superposición.

---

## Reglas de fecha

### Anticipación mínima

Si el cliente consulta turnos para hoy, no mostrar horarios menores a:

```txt
hora actual + min_booking_notice_minutes
```

Ejemplo:

```txt
Hora actual: 10:30
min_booking_notice_minutes: 60
Primer horario posible: 11:30 o el siguiente slot válido
```

---

### Días máximos hacia adelante

Si el cliente consulta una fecha posterior a `max_booking_days_ahead`, devolver error o `[]`.

Recomendación:

Para `available-slots`, devolver `[]`.

Para crear turno, devolver error claro:

```txt
No se pueden reservar turnos con tanta anticipación.
```

---

## Integración con creación de turnos

Modificar creación de turnos para que:

* Use el estado inicial según configuración.
* Valide `min_booking_notice_minutes`.
* Valide `max_booking_days_ahead`.
* Use `default_buffer_minutes` si corresponde.

No permitir crear turnos fuera de las reglas configuradas.

---

## Frontend

Agregar dentro de `/settings` una subsección o pestaña llamada:

```txt
Turnos
```

Si ya existen tabs:

```txt
General | Horarios laborales | Turnos
```

---

## Componentes frontend sugeridos

```txt
src/features/settings/components/AppointmentSettingsForm.tsx
src/features/settings/appointmentSettingsApi.ts
src/features/settings/appointmentSettingsTypes.ts
src/features/settings/appointmentSettingsSchema.ts
```

---

## Formulario

Campos:

* Intervalo de horarios disponibles.
* Buffer por defecto entre turnos.
* Anticipación mínima para reservar.
* Máximo de días hacia adelante para reservar.
* Confirmar turnos automáticamente.
* Permitir turnos pendientes.

Inputs sugeridos:

```txt
slot_interval_minutes → select
default_buffer_minutes → number
min_booking_notice_minutes → select o number
max_booking_days_ahead → number
auto_confirm_appointments → switch/checkbox
allow_pending_appointments → switch/checkbox
```

Opciones sugeridas para `slot_interval_minutes`:

```txt
5, 10, 15, 20, 30, 60
```

Opciones sugeridas para `min_booking_notice_minutes`:

```txt
0, 30, 60, 120, 240, 1440
```

Mostrar textos de ayuda:

```txt
Intervalo de horarios disponibles:
Define cada cuánto aparecen los turnos disponibles.

Buffer por defecto:
Tiempo extra que se bloquea después de cada turno.

Anticipación mínima:
Evita reservas demasiado cercanas a la hora actual.

Máximo de días hacia adelante:
Limita hasta cuándo puede reservar un cliente.
```

---

## Comportamiento esperado

Cuando el admin entra a `/settings` y selecciona “Turnos”:

1. Se consulta `GET /api/settings/appointments`.
2. Se cargan los valores en el formulario.
3. El admin modifica las reglas.
4. Al guardar, se envía `PUT /api/settings/appointments`.
5. Se muestra mensaje de éxito.
6. Si hay error, se muestra mensaje claro.
7. Al recargar, los cambios se mantienen.

---

## Fallback

Si no existe configuración en `appointment_settings`, usar:

```txt
slot_interval_minutes: 15
default_buffer_minutes: 15
min_booking_notice_minutes: 0
max_booking_days_ahead: 30
auto_confirm_appointments: false
allow_pending_appointments: true
```

---

## Criterios de aceptación

La implementación se considera completa cuando:

* Existe tabla `appointment_settings`.
* Existe un único registro inicial.
* Existen endpoints protegidos para leer y actualizar configuración de turnos.
* El admin puede editar la configuración desde `/settings`.
* Los cambios se guardan en Supabase.
* Al recargar, los cambios se mantienen.
* `available-slots` usa `slot_interval_minutes`.
* `available-slots` respeta anticipación mínima.
* `available-slots` respeta máximo de días hacia adelante.
* La creación de turnos respeta la configuración.
* El estado inicial del turno depende de `auto_confirm_appointments` y `allow_pending_appointments`.
* El sistema sigue bloqueando correctamente turnos `pending` y `confirmed`.
* No se rompe configuración general.
* No se rompe horarios laborales.
* No se rompe dashboard, clientes, servicios ni turnos.
