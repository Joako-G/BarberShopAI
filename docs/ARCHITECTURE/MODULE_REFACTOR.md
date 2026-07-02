# SDD — Refactorización Arquitectónica hacia MVP Unipersonal

**Proyecto:** BarberShop Backend  
**Versión:** 1.1  
**Prioridad:** Media  
**Estado:** Adaptado al MVP unipersonal

---

# Nota importante de alcance

Este documento queda como referencia arquitectónica.

La prioridad actual del proyecto está definida en:

```txt
docs/MVP_UNIPERSONAL_SDD.md
```

El sistema ya no debe priorizar una arquitectura grande para múltiples barberos.

El objetivo actual es entregar un MVP simple para una barbería de una sola persona.

---

# Objetivo

Mantener una arquitectura ordenada, pero sin sobreingeniería.

La arquitectura debe soportar:

- Login del admin.
- CRUD de servicios.
- Clientes sin login.
- Reservas públicas.
- Gestión privada de turnos.

---

# Estructura sugerida

```txt
src/
├── config/
│   ├── env.ts
│   └── supabase.ts
│
├── middlewares/
│   ├── auth.middleware.ts
│   ├── require-role.middleware.ts
│   └── error-handler.ts
│
├── modules/
│   ├── auth/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── types/
│   │   └── use-cases/
│   │
│   ├── profiles/
│   │   ├── controllers/
│   │   ├── repositories/
│   │   ├── routes/
│   │   ├── types/
│   │   └── use-cases/
│   │
│   ├── services/
│   │   ├── controllers/
│   │   ├── repositories/
│   │   ├── routes/
│   │   ├── types/
│   │   └── use-cases/
│   │
│   ├── customers/
│   │   ├── controllers/
│   │   ├── repositories/
│   │   ├── routes/
│   │   ├── types/
│   │   └── use-cases/
│   │
│   └── appointments/
│       ├── controllers/
│       ├── repositories/
│       ├── routes/
│       ├── types/
│       └── use-cases/
│
├── shared/
│   ├── errors/
│   ├── types/
│   ├── utils/
│   └── api-response.ts
│
├── app.ts
└── server.ts
```

---

# Módulos activos para el MVP

Implementar o mantener:

- auth
- profiles
- services
- customers
- appointments

---

# Módulos pausados

No implementar todavía:

- barbers
- payments
- notifications
- dashboard avanzado
- availability avanzada
- branches
- reviews

Si ya existen archivos de estos módulos, no es obligatorio eliminarlos. Pero no deben bloquear ni condicionar el MVP.

En el estado actual del MVP, el módulo `barbers` puede permanecer en el código
como referencia futura, pero sus rutas HTTP no deben exportarse ni montarse en
`/api/barbers`.

---

# Flujo recomendado

```txt
Controller
    ↓
Use Case
    ↓
Repository
```

El controller debe:

- Recibir request.
- Validar datos básicos o llamar schemas.
- Invocar use case.
- Devolver response.

El use case debe:

- Ejecutar reglas de negocio.
- Coordinar repositorios.
- Lanzar errores controlados.

El repository debe:

- Acceder a Supabase.
- Ejecutar queries.
- No contener reglas de negocio.

---

# Use Cases activos

## Auth

```txt
LoginUseCase
GetAuthenticatedProfileUseCase
```

## Services

```txt
CreateServiceUseCase
UpdateServiceUseCase
GetServiceByIdUseCase
ListServicesUseCase
ToggleServiceStatusUseCase
```

No exponer `DeleteServiceUseCase` desde rutas HTTP del MVP. La baja de servicios
se modela con `is_active`.

## Customers

```txt
FindOrCreateCustomerUseCase
ListCustomersUseCase
GetCustomerByIdUseCase
```

## Appointments

```txt
CreatePublicAppointmentUseCase
ListAppointmentsUseCase
GetAppointmentByIdUseCase
ConfirmAppointmentUseCase
CancelAppointmentUseCase
CompleteAppointmentUseCase
MarkNoShowAppointmentUseCase
GetAvailableSlotsUseCase
```

---

# Seguridad

Mantener:

```txt
auth.middleware.ts
require-role.middleware.ts
```

Para endpoints privados usar:

```ts
authenticate
requireRole("admin")
```

Para endpoints públicos no usar autenticación:

```http
GET /api/services
GET /api/available-slots
POST /api/appointments/public
```

## Uso de Supabase Admin

Para operaciones internas del backend se debe usar siempre `supabaseAdmin`.

El cliente `supabase` con anon key queda reservado principalmente para autenticación.

Los repositories CRUD no deben usar `supabase`; deben usar `supabaseAdmin`.

---

# Trazabilidad MVP

| Caso de uso | Use Case |
|---|---|
| Login admin | LoginUseCase |
| Obtener perfil | GetAuthenticatedProfileUseCase |
| Crear servicio | CreateServiceUseCase |
| Editar servicio | UpdateServiceUseCase |
| Activar/desactivar servicio | ToggleServiceStatusUseCase |
| Crear/reutilizar cliente | FindOrCreateCustomerUseCase |
| Reservar turno público | CreatePublicAppointmentUseCase |
| Consultar horarios disponibles | GetAvailableSlotsUseCase |
| Listar turnos | ListAppointmentsUseCase |
| Ver turno | GetAppointmentByIdUseCase |
| Confirmar turno | ConfirmAppointmentUseCase |
| Cancelar turno | CancelAppointmentUseCase |
| Completar turno | CompleteAppointmentUseCase |
| Marcar ausente | MarkNoShowAppointmentUseCase |

---

# Criterios de aceptación

- La arquitectura compila sin errores.
- No se implementan módulos fuera del MVP.
- Los controllers no contienen lógica de negocio pesada.
- Los repositories no contienen reglas de negocio.
- El admin puede iniciar sesión.
- El admin puede gestionar servicios.
- El cliente puede reservar sin login.
- El sistema evita turnos superpuestos.
