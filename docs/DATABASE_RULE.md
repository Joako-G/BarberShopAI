# DATABASE_RULE — MVP Barbería Unipersonal

## Objetivo

Adaptar la base de datos actual a un MVP simple para una barbería de una sola persona.

No rehacer la base desde cero.

Priorizar:

1. Mantener lo existente.
2. Adaptar lo necesario.
3. Crear únicamente lo que falte.

---

# Tablas que se mantienen

## profiles

Mantener la tabla actual `profiles`.

Uso en el MVP:

- Representa al dueño/barbero único.
- Debe existir un usuario admin ya creado en Supabase Auth.
- El `id` debe coincidir con `auth.users.id`.

Campos actuales:

```txt
id uuid primary key references auth.users(id)
full_name text
phone varchar
role text
is_active boolean default true
created_at timestamptz default now()
updated_at timestamptz
```

Para el MVP usar:

```txt
role = admin
```

Roles pausados:

```txt
barber
customer
```

No eliminar necesariamente esos valores si ya existen, pero no usarlos en esta versión.

---

## services

Mantener la tabla actual `services`.

No recrearla.

Campos actuales:

```txt
id uuid
name text
description text
duration_minutes integer
buffer_minutes integer
price numeric
is_active boolean
created_at timestamptz
```

Reglas:

- `duration_minutes` debe ser mayor a 0.
- `buffer_minutes` puede ser 0 o mayor.
- `price` debe ser mayor o igual a 0.
- `is_active = false` impide nuevas reservas con ese servicio.

---

# Tabla nueva requerida

## customers

Actualmente no existe una tabla `customers`.

Crear esta tabla para guardar clientes sin login.

Los clientes no deben crearse en Supabase Auth.

Campos sugeridos:

```txt
id uuid primary key default gen_random_uuid()
full_name text not null
phone varchar not null
email text null
created_at timestamptz default now()
updated_at timestamptz
```

Restricción e índice requeridos:

```sql
alter table customers
add constraint customers_phone_unique unique (phone);
```

Regla:

- Reutilizar customer por `phone` al crear una reserva pública.
- Guardar `phone` normalizado, usando únicamente dígitos.
- La aplicación debe recuperar el customer existente si dos solicitudes concurrentes intentan crear el mismo teléfono.

---

# Tabla appointments

Si ya existe, adaptarla al MVP.

Si no existe, crearla.

Campos mínimos recomendados:

```txt
id uuid primary key default gen_random_uuid()
customer_id uuid not null references customers(id)
service_id uuid not null references services(id)
appointment_date date not null
start_time time not null
end_time time not null
status text not null
notes text null
created_at timestamptz default now()
updated_at timestamptz
```

Si la tabla actual tiene `barber_id`:

- No eliminarlo obligatoriamente.
- Dejarlo nullable si es posible.
- No requerirlo desde el endpoint público.
- No usarlo como filtro obligatorio en el MVP.

Relaciones MVP:

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

Índices recomendados:

```sql
create index if not exists idx_appointments_date on appointments(appointment_date);
create index if not exists idx_appointments_status on appointments(status);
create index if not exists idx_appointments_customer_id on appointments(customer_id);
create index if not exists idx_appointments_service_id on appointments(service_id);
```

Las altas y modificaciones de horario deben realizarse mediante:

```txt
create_appointment_atomic
update_appointment_atomic
```

Ambas funciones validan la superposición e insertan o actualizan dentro de una
misma transacción. Su ejecución está reservada al rol `service_role`.

El flujo utilizado por la aplicación para nuevas reservas es:

```txt
create_appointment_with_customer_atomic
```

Esta función crea o reutiliza el customer y crea el turno en una única
transacción, evitando customers huérfanos.

Los cambios de estado utilizan:

```txt
transition_appointment_status_atomic
```

Las funciones de creación y edición bloquean la fila del servicio con
`FOR SHARE`, coordinándose con una desactivación simultánea.

La migración reproducible se encuentra en:

```txt
supabase/migrations/20260625_atomic_appointment_booking.sql
```

---

# Tablas pausadas

## barbers

Pausar el uso de la tabla `barbers` para el MVP.

Motivo:

- La barbería es unipersonal.
- El admin representa al dueño/barbero.
- No hace falta seleccionar barbero en la reserva pública.

No eliminar la tabla si ya existe, pero no seguir desarrollando este módulo ahora.

---

## business_hours

Pausar el uso obligatorio de `business_hours`.

Para el MVP se permite usar horario laboral simple definido por configuración o constante.

Ejemplo:

```txt
Lunes a sábado
09:00 a 18:00
```

Más adelante se podrá reactivar esta tabla para horarios configurables.

---

# SQL sugerido para customers

```sql
create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone varchar not null,
  email text null,
  created_at timestamptz default now(),
  updated_at timestamptz
);

alter table customers
add constraint customers_phone_unique unique (phone);
```

---

# SQL sugerido para appointments

Ajustar según si la tabla ya existe o no.

```sql
create table if not exists appointments (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id),
  service_id uuid not null references services(id),
  appointment_date date not null,
  start_time time not null,
  end_time time not null,
  status text not null default 'pending',
  notes text null,
  created_at timestamptz default now(),
  updated_at timestamptz
);
```

---

# Reglas de migración

Antes de aplicar cambios:

1. Revisar si `appointments` ya existe.
2. Si existe, no recrearla.
3. Si `customer_id` apunta a `profiles.id`, cambiar el diseño futuro para que apunte a `customers.id`.
4. Si hay datos reales, no borrar nada sin backup.
5. Si no hay datos reales, se puede simplificar con mayor libertad.

---

# No hacer

No crear para el MVP:

- Tabla payments.
- Tabla notifications.
- Tabla branches.
- Tabla reviews.
- Tabla customer_auth.
