# Roadmap — Sistema de Turnos para Barbería Unipersonal

## Objetivo actual

Desarrollar una aplicación web simple para gestionar turnos de una barbería de una sola persona.

El sistema debe priorizar un MVP funcional antes que una arquitectura grande o preparada para múltiples barberos.

---

# Stack

## Frontend

- React
- TypeScript
- Tailwind CSS
- React Router
- TanStack Query
- React Hook Form
- Zod

## Backend

- Node.js
- Express
- TypeScript

## Base de datos

- Supabase PostgreSQL

## Autenticación

- Supabase Auth solamente para el dueño/barbero.

---

# Alcance del MVP

## Incluido

- Login del admin/dueño.
- CRUD de servicios.
- Reserva pública de turnos.
- Clientes sin cuenta.
- Gestión de turnos desde panel privado.
- Cálculo simple de disponibilidad.
- Validación de superposición de turnos.

## No incluido por ahora

- Múltiples barberos.
- Registro de clientes con login.
- Creación de usuarios tipo barbero.
- Pagos.
- Notificaciones automáticas.
- Dashboard avanzado.
- Múltiples sucursales.
- Horarios laborales complejos por barbero.

---

# Roles del sistema

## Admin

Representa al dueño/barbero único.

Puede:

- Iniciar sesión.
- Crear servicios.
- Editar servicios.
- Activar/desactivar servicios.
- Ver todos los turnos.
- Confirmar turnos.
- Cancelar turnos.
- Completar turnos.
- Marcar ausentes.

## Cliente

No tiene login.

Puede:

- Ver servicios activos.
- Reservar turno desde pantalla pública.
- Ingresar nombre, teléfono y email opcional.

---

# Flujo principal

```txt
Admin/dueño
    ↓
Login
    ↓
Gestiona servicios y turnos

Cliente
    ↓
Elige servicio
    ↓
Elige fecha y horario
    ↓
Carga nombre y teléfono
    ↓
Reserva turno sin registrarse
```

---

# Orden recomendado de desarrollo

## Etapa 1 — Ajuste del alcance

- Crear `MVP_UNIPERSONAL_SDD.md`.
- Actualizar documentación existente.
- Pausar módulos fuera del MVP.

## Etapa 2 — Backend base

- Auth login del admin.
- Middleware `authenticate`.
- Middleware `requireRole("admin")`.
- CRUD de servicios.
- Crear tabla `customers`.
- Crear o adaptar tabla `appointments`.

## Etapa 3 — Reservas

- Endpoint público `POST /api/appointments/public`.
- Crear o reutilizar customer por teléfono.
- Calcular `end_time`.
- Validar superposición.
- Crear turno en estado `pending`.

## Etapa 4 — Panel privado

- Listar turnos.
- Ver detalle de turno.
- Confirmar turno.
- Cancelar turno.
- Completar turno.
- Marcar turno como ausente.

## Etapa 5 — Frontend MVP

- Pantalla pública de servicios.
- Pantalla pública de reserva.
- Login admin.
- Dashboard simple de turnos.
- Gestión de servicios.

---

# Estado actual esperado

```txt
✅ Profiles existente
✅ Usuario admin existente
✅ Services existente o parcialmente implementado
⬜ Customers
⬜ Appointments MVP
⬜ Reserva pública
⬜ Login admin integrado
⬜ Dashboard simple
```

---

# Futuras versiones

## V2

- Configuración de horarios laborales.
- Bloqueo manual de horarios.
- Notificaciones por WhatsApp.
- Dashboard con métricas simples.

## V3

- Múltiples barberos.
- Clientes con cuenta.
- Pagos.
- Reportes avanzados.
- Sucursales.
