# API_SPEC — MVP Barbería Unipersonal

## Auth

### Login admin

```http
POST /api/auth/login
```

Body:

```json
{
  "email": "admin@email.com",
  "password": "password"
}
```

Notas:

- Autentica contra Supabase Auth.
- Solo se usa para el dueño/barbero.
- No implementar registro público de usuarios en el MVP.

---

## Profiles

### Obtener perfil autenticado

```http
GET /api/profiles/me
```

Requiere:

```txt
authenticate
```

Notas:

- Devuelve el perfil asociado al token autenticado.
- Debe declararse antes de `GET /api/profiles/:id` para evitar que `me` sea interpretado como id.

---

## Settings

### Obtener configuración general

```http
GET /api/settings/general
```

Privado.

Requiere:

```txt
authenticate
requireRole("admin")
```

Devuelve la configuración general del sistema y negocio.

---

### Actualizar configuración general

```http
PUT /api/settings/general
```

Privado.

Requiere:

```txt
authenticate
requireRole("admin")
```

Body:

```json
{
  "system_name": "BarberPro",
  "business_name": "Barbería El Corte",
  "business_type": "Barbería",
  "description": "Turnos online para barbería.",
  "phone": "3880000000",
  "whatsapp": "3880000000",
  "email": "contacto@barberia.com",
  "address": "San Salvador de Jujuy"
}
```

Reglas:

- Solo el admin puede leer y modificar esta configuración.
- Los campos opcionales vacíos se guardan como `null`.
- No modifica horarios laborales, colores, mensajes ni redes sociales.

---

### Obtener horarios laborales

```http
GET /api/settings/business-hours
```

Privado.

Requiere:

```txt
authenticate
requireRole("admin")
```

Devuelve los 7 dias de la semana configurados para calcular disponibilidad.

---

### Actualizar horarios laborales

```http
PUT /api/settings/business-hours
```

Privado.

Requiere:

```txt
authenticate
requireRole("admin")
```

Body:

```json
{
  "hours": [
    {
      "day_of_week": 0,
      "is_open": false,
      "start_time": null,
      "end_time": null
    },
    {
      "day_of_week": 1,
      "is_open": true,
      "start_time": "09:00",
      "end_time": "22:00"
    }
  ]
}
```

Reglas:

- Deben enviarse exactamente 7 dias.
- `day_of_week` debe ir de 0 a 6.
- No puede haber dias repetidos.
- Si `is_open` es `false`, `start_time` y `end_time` pueden ser `null`.
- Si `is_open` es `true`, `start_time` y `end_time` son obligatorios.
- `start_time` debe ser menor que `end_time`.
- El formato de hora debe ser `HH:MM`.

---

### Obtener configuración de turnos

```http
GET /api/settings/appointments
```

Privado.

Requiere:

```txt
authenticate
requireRole("admin")
```

Devuelve las reglas generales usadas para disponibilidad y reservas.

---

### Actualizar configuración de turnos

```http
PUT /api/settings/appointments
```

Privado.

Requiere:

```txt
authenticate
requireRole("admin")
```

Body:

```json
{
  "slot_interval_minutes": 15,
  "default_buffer_minutes": 15,
  "min_booking_notice_minutes": 0,
  "max_booking_days_ahead": 30,
  "auto_confirm_appointments": false,
  "allow_pending_appointments": true
}
```

Reglas:

- `slot_interval_minutes` permite 5, 10, 15, 20, 30 o 60.
- `default_buffer_minutes` debe estar entre 0 y 120.
- `min_booking_notice_minutes` debe estar entre 0 y 10080.
- `max_booking_days_ahead` debe estar entre 1 y 365.
- `auto_confirm_appointments` y `allow_pending_appointments` afectan reservas públicas.
- Los turnos creados por admin se crean `confirmed`.

---

### Obtener configuración de apariencia

```http
GET /api/settings/appearance
```

Privado.

Requiere:

```txt
authenticate
requireRole("admin")
```

Devuelve los colores, modo visual y radio de bordes usados por el panel administrativo.

---

### Actualizar configuración de apariencia

```http
PUT /api/settings/appearance
```

Privado.

Requiere:

```txt
authenticate
requireRole("admin")
```

Body:

```json
{
  "theme_mode": "dark",
  "primary_color": "#75CFFF",
  "secondary_color": "#94A3B8",
  "accent_color": "#D4AF37",
  "background_color": "#07111F",
  "text_color": "#F8FAFC",
  "border_radius": 12
}
```

Reglas:

- `theme_mode` debe ser `dark` o `light`.
- Los colores deben usar formato hexadecimal `#RRGGBB`.
- `border_radius` debe ser entero entre 0 y 32.

---

## Services

### Listar servicios activos

```http
GET /api/services
```

Público.

Debe devolver servicios activos para la reserva pública.

---

### Obtener servicio por id

```http
GET /api/services/:id
```

Público.

---

### Listar todos los servicios para administración

```http
GET /api/services/admin
```

Privado. Devuelve servicios activos e inactivos.

Requiere:

```txt
authenticate
requireRole("admin")
```

---

### Crear servicio

```http
POST /api/services
```

Privado.

Requiere:

```txt
authenticate
requireRole("admin")
```

---

### Editar servicio

```http
PUT /api/services/:id
```

Privado.

Requiere:

```txt
authenticate
requireRole("admin")
```

---

### Activar o desactivar servicio

```http
PATCH /api/services/:id/status
```

Privado.

Requiere:

```txt
authenticate
requireRole("admin")
```

Notas:

- No existe `DELETE /api/services/:id` en el MVP.
- Los servicios se pausan con `PATCH /api/services/:id/status` para conservar historial de turnos.

---

## Customers

### Crear cliente

```http
POST /api/customers
```

Privado o uso interno.

Requiere:

```txt
authenticate
requireRole("admin")
```

Notas:

- Para reserva pública, el cliente debe crearse internamente desde `POST /api/appointments/public`.
- Los clientes no tienen login.

---

### Listar clientes

```http
GET /api/customers
```

Privado.

Requiere:

```txt
authenticate
requireRole("admin")
```

---

## Appointments

### Crear turno desde el panel admin

```http
POST /api/appointments
```

Privado.

Requiere:

```txt
authenticate
requireRole("admin")
```

Body:

```json
{
  "customer_mode": "existing",
  "customer_id": "uuid-customer",
  "service_id": "uuid-service",
  "appointment_date": "2026-06-25",
  "start_time": "10:00",
  "notes": "Opcional"
}
```

También permite crear el turno ingresando un cliente nuevo:

```json
{
  "customer_mode": "new",
  "full_name": "Juan Pérez",
  "phone": "2915551234",
  "email": "juan@email.com",
  "service_id": "uuid-service",
  "appointment_date": "2026-06-25",
  "start_time": "10:00",
  "notes": "Opcional"
}
```

Reglas:

- Con `customer_mode = existing`, el customer debe existir.
- Con `customer_mode = new`, se crea o reutiliza el customer por teléfono.
- Por compatibilidad, si se envía `customer_id` sin `customer_mode`, se
  interpreta como un customer existente.
- El servicio debe existir y estar activo.
- Calcula `end_time` con `duration_minutes + appointment_settings.default_buffer_minutes`.
- Valida fecha, horario laboral y superposición.
- Crea el turno con estado `confirmed`.

---

### Crear turno público

```http
POST /api/appointments/public
```

Público.

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

Reglas:

- No requiere login.
- Guarda nombre, teléfono y email en el turno como datos temporales.
- Calcula `end_time` con `duration_minutes + appointment_settings.default_buffer_minutes`.
- Valida superposición.
- La validación definitiva y la inserción se ejecutan atómicamente en PostgreSQL.
- Crea el turno en estado `pending` por defecto sin crear customer.
- Si `auto_confirm_appointments` está activo o no se permiten pendientes, crea el turno `confirmed` y crea o reutiliza el customer.

---

### Listar turnos

```http
GET /api/appointments
```

Privado.

Requiere:

```txt
authenticate
requireRole("admin")
```

Reglas:

- Si el turno pendiente no tiene `customer_id`, crea o reutiliza el customer por
  `guest_phone`.
- Asigna `customer_id`.
- Cambia el estado a `confirmed`.
- La operación se ejecuta atómicamente en PostgreSQL.

Filtros opcionales:

```txt
date
status
customer
```

---

### Obtener turno por id

```http
GET /api/appointments/:id
```

Privado.

Requiere:

```txt
authenticate
requireRole("admin")
```

---

### Editar turno

```http
PUT /api/appointments/:id
```

Privado.

Requiere:

```txt
authenticate
requireRole("admin")
```

Body:

```json
{
  "service_id": "uuid-service",
  "appointment_date": "2026-06-25",
  "start_time": "11:00",
  "notes": "Opcional"
}
```

Reglas:

- Solo modifica servicio, fecha, hora y notas.
- No permite modificar customer ni estado.
- No permite editar turnos `completed`, `cancelled` o `no_show`.
- Recalcula `end_time`.
- Valida superposición ignorando el turno actual.
- La validación definitiva y la actualización se ejecutan atómicamente en PostgreSQL.

---

### Confirmar turno

```http
PATCH /api/appointments/:id/confirm
```

Privado.

Requiere:

```txt
authenticate
requireRole("admin")
```

---

### Cancelar turno

```http
PATCH /api/appointments/:id/cancel
```

Privado.

Requiere:

```txt
authenticate
requireRole("admin")
```

---

### Completar turno

```http
PATCH /api/appointments/:id/complete
```

Privado.

Requiere:

```txt
authenticate
requireRole("admin")
```

---

### Marcar ausente

```http
PATCH /api/appointments/:id/no-show
```

Privado.

Requiere:

```txt
authenticate
requireRole("admin")
```

---

## Availability

### Consultar horarios disponibles

```http
GET /api/available-slots
```

Público.

Query params:

```txt
serviceId
date
excludeAppointmentId (opcional, usado al editar)
```

No usar `barberId` en el MVP.

Response:

```json
[
  "09:00",
  "10:00",
  "11:00"
]
```

---

# Endpoints pausados para futuras versiones

No implementar todavía:

```http
GET /api/barbers
POST /api/barbers
PUT /api/barbers/:id
DELETE /api/barbers/:id

POST /api/auth/register
GET /api/payments
POST /api/payments
GET /api/dashboard/metrics
```
