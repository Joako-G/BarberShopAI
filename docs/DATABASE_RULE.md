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

## business_settings

Tabla de configuración general del sistema y negocio.

Debe existir un único registro.

Campos:

```txt
id uuid primary key default gen_random_uuid()
system_name text not null
business_name text not null
business_type text null
description text null
phone text null
whatsapp text null
email text null
address text null
created_at timestamptz default now()
updated_at timestamptz default now()
```

Reglas:

- `system_name` identifica el nombre visible del panel.
- `business_name` identifica el negocio.
- Los campos opcionales se guardan como `null` cuando están vacíos.
- No usar esta tabla todavía para horarios laborales, colores, mensajes ni redes sociales.
- RLS debe estar activo.
- `anon` y `authenticated` no deben tener acceso directo.
- El backend accede mediante `supabaseAdmin`.

La migración reproducible se encuentra en:

```txt
supabase/migrations/20260702_business_settings.sql
```

---

## appointment_settings

Tabla de configuración general de reglas de turnos.

Debe existir un único registro.

Campos:

```txt
id uuid primary key default gen_random_uuid()
slot_interval_minutes int not null default 15
default_buffer_minutes int not null default 15
min_booking_notice_minutes int not null default 0
max_booking_days_ahead int not null default 30
auto_confirm_appointments boolean not null default false
allow_pending_appointments boolean not null default true
created_at timestamptz default now()
updated_at timestamptz default now()
```

Reglas:

- `slot_interval_minutes` define cada cuánto se generan slots disponibles.
- `default_buffer_minutes` es el buffer global real usado por disponibilidad y creación de turnos.
- `services.buffer_minutes` queda como campo legacy y no se usa para la lógica nueva.
- `min_booking_notice_minutes` evita reservas demasiado cercanas.
- `max_booking_days_ahead` limita la anticipación máxima.
- `auto_confirm_appointments` y `allow_pending_appointments` afectan reservas públicas.
- Los turnos creados por admin se crean `confirmed`.
- RLS debe estar activo.
- `anon` y `authenticated` no deben tener acceso directo.
- El backend accede mediante `supabaseAdmin`.

La migración reproducible se encuentra en:

```txt
supabase/migrations/20260702_appointment_settings.sql
```

---

## appearance_settings

Tabla de configuración visual del panel administrativo.

Debe existir un único registro.

Campos:

```txt
id uuid primary key default gen_random_uuid()
singleton boolean not null default true
theme_mode text not null default 'dark'
primary_color text not null default '#75CFFF'
secondary_color text not null default '#94A3B8'
accent_color text not null default '#D4AF37'
background_color text not null default '#07111F'
text_color text not null default '#F8FAFC'
border_radius int not null default 12
created_at timestamptz default now()
updated_at timestamptz default now()
```

Reglas:

- `theme_mode` debe ser `dark` o `light`.
- Los colores deben usar formato hexadecimal `#RRGGBB`.
- `border_radius` debe estar entre 0 y 32.
- `singleton` evita más de un registro de configuración.
- RLS debe estar activo.
- `anon` y `authenticated` no deben tener acceso directo.
- El backend accede mediante `supabaseAdmin`.
- La configuración se aplica al panel administrativo con CSS variables.

La migración reproducible se encuentra en:

```txt
supabase/migrations/20260702_appearance_settings.sql
```

---

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

- Reutilizar customer por `phone` al confirmar una reserva pública.
- Guardar `phone` normalizado, usando únicamente dígitos.
- La aplicación debe recuperar el customer existente si dos solicitudes concurrentes intentan crear el mismo teléfono.

---

# Tabla appointments

Si ya existe, adaptarla al MVP.

Si no existe, crearla.

Campos mínimos recomendados:

```txt
id uuid primary key default gen_random_uuid()
customer_id uuid null references customers(id)
guest_full_name text null
guest_phone varchar null
guest_email text null
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
create_public_appointment_atomic
confirm_appointment_atomic
```

`create_appointment_with_customer_atomic` se usa para turnos administrativos.
`create_public_appointment_atomic` crea el turno público `pending` con datos
temporales y sin customer. `confirm_appointment_atomic` crea o reutiliza el
customer y confirma el turno en una única transacción.

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
  customer_id uuid null references customers(id),
  guest_full_name text null,
  guest_phone varchar null,
  guest_email text null,
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
