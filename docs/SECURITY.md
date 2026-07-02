# SECURITY — MVP Barbería Unipersonal

## Objetivo

Proteger las acciones administrativas y permitir reservas públicas sin exponer operaciones sensibles.

---

# Autenticación

Usar Supabase Auth.

Solo el dueño/barbero debe iniciar sesión.

El usuario admin ya debe existir en:

- Supabase Auth.
- Tabla `profiles`.

No almacenar contraseñas manualmente.

Si una solicitud autenticada responde `401`, el frontend debe:

- Limpiar el token y el estado autenticado.
- Redirigir al login mediante la ruta protegida.
- Informar que la sesión expiró.

Un `401` de `/api/auth/login` o de una solicitud pública no debe cerrar una
sesión existente.

---

# Registro público

No implementar registro público de usuarios en el MVP.

No crear endpoint:

```http
POST /api/auth/register
```

Los clientes no tienen cuenta.

Los clientes no existen en Supabase Auth.

---

# Roles

Para el MVP se usa solamente:

```txt
admin
```

El rol `admin` representa al dueño/barbero único.

Los roles `barber` y `customer` quedan fuera del MVP.

---

# Endpoints públicos

Estos endpoints no requieren login:

```http
GET /api/services
GET /api/services/:id
GET /api/available-slots
POST /api/appointments/public
```

Reglas:

- Deben validar todos los datos de entrada.
- No deben permitir modificar servicios.
- No deben exponer información sensible del admin.
- No deben devolver tokens ni datos internos.

---

# Endpoints privados

Estos endpoints requieren:

```ts
authenticate
requireRole("admin")
```

Endpoints:

```http
GET /api/profiles/me

GET /api/settings/general
PUT /api/settings/general
GET /api/settings/business-hours
PUT /api/settings/business-hours
GET /api/settings/appointments
PUT /api/settings/appointments

POST /api/services
GET /api/services/admin
PUT /api/services/:id
PATCH /api/services/:id/status

POST /api/appointments
GET /api/appointments
GET /api/appointments/:id
PUT /api/appointments/:id
PATCH /api/appointments/:id/confirm
PATCH /api/appointments/:id/cancel
PATCH /api/appointments/:id/complete
PATCH /api/appointments/:id/no-show

GET /api/customers
POST /api/customers
```

`GET /api/profiles/me` requiere `authenticate`. Las demás rutas HTTP de
perfiles administrativos requieren `authenticate` y `requireRole("admin")`.

---

# Protección de acciones administrativas

Solo el admin puede:

- Crear servicios.
- Editar servicios.
- Activar o desactivar servicios.
- Ver turnos.
- Crear turnos confirmados desde el panel.
- Editar datos de turnos no finalizados.
- Confirmar turnos.
- Cancelar turnos.
- Completar turnos.
- Marcar ausentes.
- Ver clientes.
- Ver y modificar configuración general del sistema.
- Ver y modificar horarios laborales.
- Ver y modificar configuración de turnos.

---

# Validación de entrada

Validar todos los requests con Zod.

Validar especialmente:

- phone
- full_name
- service_id
- appointment_date
- start_time
- status
- price
- duration_minutes
- buffer_minutes
- system_name
- business_name
- business_type
- email
- address

---

# Seguridad en reservas públicas

El endpoint público de reserva debe validar:

- Servicio existente.
- Servicio activo.
- Fecha no pasada.
- Horario no pasado.
- No superposición.
- Teléfono válido.
- Nombre obligatorio.

No confiar en el frontend.

---

## Uso de Supabase Admin

Para operaciones internas del backend se debe usar siempre `supabaseAdmin`.

El cliente `supabase` con anon key queda reservado principalmente para autenticación.

Los repositories CRUD no deben usar `supabase`; deben usar `supabaseAdmin`.

La autenticación de credenciales y la validación del access token utilizan el
cliente público de Supabase Auth. La lectura del rol y los datos de `profiles`
se realiza internamente con `supabaseAdmin`; `anon` y `authenticated` no tienen
acceso directo a la tabla `profiles`.

El módulo HTTP de `barbers` está deshabilitado para el MVP y no debe montarse en
el router principal.

La tabla `business_settings` no debe exponerse directamente a `anon` ni
`authenticated`. La lectura y actualización se realizan únicamente desde los
endpoints protegidos `/api/settings/general` mediante `supabaseAdmin`.

Las funciones PostgreSQL:

```txt
create_appointment_atomic
update_appointment_atomic
create_appointment_with_customer_atomic
create_public_appointment_atomic
confirm_appointment_atomic
transition_appointment_status_atomic
```

son `SECURITY DEFINER` y su ejecución debe estar revocada para `public`,
`anon` y `authenticated`. Solo el backend, mediante `supabaseAdmin` y una
clave `sb_secret_...` o `service_role`, puede invocarlas.

---

# Secretos

Guardar secretos solo en:

```txt
.env
```

Nunca commitear:

- SUPABASE_SERVICE_ROLE_KEY
- SUPABASE_ANON_KEY si el proyecto la considera sensible
- JWT secrets
- tokens
- passwords

---

# Logging

No loguear:

- Passwords.
- Tokens.
- Service role key.
- Authorization headers.
- Datos sensibles innecesarios.
- URLs o configuración interna de Supabase en logs de producción.

---

# Fuera del MVP

No implementar todavía:

- Registro público.
- Recuperación avanzada de cuenta.
- Roles complejos.
- Permisos por barbero.
- Clientes autenticados.

---

# Rate limiting

Se aplican límites por IP a:

- `POST /api/auth/login`: cuenta solamente intentos fallidos.
- `POST /api/appointments/public`: cuenta solicitudes de reserva.

Al superar el límite, la API responde `429 Too Many Requests`.

El almacenamiento actual es en memoria y es suficiente para desarrollo o una
sola instancia. En un despliegue con múltiples instancias debe utilizarse un
store compartido como Redis.

# CORS

Durante desarrollo se permiten automáticamente orígenes HTTP de `localhost` y
`127.0.0.1` en cualquier puerto.

En producción solo se permiten los orígenes exactos configurados:

```env
ALLOWED_ORIGINS=https://tu-app.vercel.app
```

Las URLs de preview de Vercel deben agregarse explícitamente cuando se necesiten.
