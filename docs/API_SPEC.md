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
- Calcula `end_time` con `duration_minutes + buffer_minutes`.
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
- Calcula `end_time` con `duration_minutes + buffer_minutes`.
- Valida superposición.
- La validación definitiva y la inserción se ejecutan atómicamente en PostgreSQL.
- Crea el turno en estado `pending` sin crear customer.

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
