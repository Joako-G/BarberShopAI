# Casos de Uso — MVP Barbería Unipersonal

## Alcance actual

Este documento reemplaza como prioridad al set de casos de uso grande para múltiples barberos.

El objetivo actual es implementar un MVP simple para una barbería de una sola persona.

---

# Casos incluidos en el MVP

## CU-01 — Iniciar sesión como admin

**Actor principal:** Admin / dueño / barbero único  
**Objetivo:** Permitir el acceso al panel privado.

### Flujo principal

1. El admin ingresa email y contraseña.
2. El backend autentica contra Supabase Auth.
3. El sistema obtiene el perfil asociado.
4. Valida que el perfil tenga `role = admin`.
5. Devuelve sesión/token.

### Reglas

- Solo el admin inicia sesión.
- Los clientes no tienen login.
- No existe registro público en el MVP.

---

## CU-02 — Obtener perfil autenticado

**Actor principal:** Admin  
**Objetivo:** Consultar los datos del perfil propio.

### Flujo principal

1. El sistema recibe el token.
2. Valida la sesión.
3. Busca el perfil asociado.
4. Devuelve los datos.

---

## CU-03 — Crear servicio

**Actor principal:** Admin  
**Objetivo:** Crear un servicio ofrecido por la barbería.

### Flujo principal

1. El admin ingresa nombre, descripción, duración, buffer y precio.
2. El sistema valida los datos.
3. Crea el servicio.
4. Devuelve el servicio creado.

### Reglas

- `duration_minutes` debe ser mayor a 0.
- `buffer_minutes` debe ser mayor o igual a 0.
- `price` debe ser mayor o igual a 0.

---

## CU-03A — Gestionar configuración general

**Actor principal:** Admin  
**Objetivo:** Modificar los datos generales del sistema y negocio.

### Flujo principal

1. El admin ingresa a `/settings`.
2. El sistema consulta `GET /api/settings/general`.
3. El formulario muestra la configuración actual.
4. El admin modifica los datos.
5. El sistema valida los datos.
6. El sistema guarda mediante `PUT /api/settings/general`.
7. El panel reutiliza `system_name` y datos generales actualizados.

### Reglas

- Requiere autenticación y rol `admin`.
- No modifica horarios laborales.
- No modifica colores, mensajes, redes sociales ni configuración avanzada de turnos.

---

## CU-04 — Listar servicios activos

**Actor principal:** Cliente / público  
**Objetivo:** Mostrar servicios disponibles para reservar.

### Flujo principal

1. El sistema consulta servicios activos.
2. Devuelve la lista.

### Reglas

- No mostrar servicios inactivos en la reserva pública.

---

## CU-05 — Editar servicio

**Actor principal:** Admin  
**Objetivo:** Modificar datos de un servicio.

### Flujo principal

1. El admin selecciona un servicio.
2. Modifica datos.
3. El sistema valida.
4. Guarda cambios.

---

## CU-06 — Activar o desactivar servicio

**Actor principal:** Admin  
**Objetivo:** Habilitar o pausar servicios sin eliminarlos.

### Flujo principal

1. El admin selecciona el servicio.
2. El sistema cambia `is_active`.
3. Devuelve confirmación.

### Reglas

- Un servicio inactivo no puede usarse para nuevas reservas.
- Los turnos históricos deben conservar el servicio original.

---

## CU-07 — Crear o reutilizar cliente

**Actor principal:** Sistema  
**Objetivo:** Registrar clientes sin login cuando el admin crea o confirma un turno.

### Flujo principal

1. El sistema recibe nombre, teléfono y email opcional desde el panel admin o desde un turno público pendiente.
2. El sistema busca un customer existente por teléfono.
3. Si existe, lo reutiliza.
4. Si no existe, crea uno nuevo.
5. Devuelve el customer.

### Reglas

- El cliente no se crea en Supabase Auth.
- El teléfono es el identificador principal para reutilización.

---

## CU-08 — Reservar turno público

**Actor principal:** Cliente  
**Objetivo:** Permitir que un cliente reserve turno sin registrarse.

### Flujo principal

1. El cliente selecciona servicio.
2. Selecciona fecha.
3. Selecciona horario.
4. Ingresa nombre y teléfono.
5. El backend valida servicio activo.
6. Calcula `end_time`.
7. Valida que no haya superposición.
8. Guarda nombre, teléfono y email como datos temporales del turno.
9. Crea turno con estado `pending` sin crear customer.
10. Devuelve confirmación.

### Reglas

- No requiere login.
- No permite fechas pasadas.
- No permite horarios pasados.
- No permite superposición.
- El turno se crea como `pending`.
- El customer se crea o reutiliza recién cuando el admin confirma el turno.

---

## CU-09 — Consultar horarios disponibles

**Actor principal:** Cliente  
**Objetivo:** Mostrar horarios libres para reservar.

### Flujo principal

1. El cliente selecciona servicio y fecha.
2. El sistema obtiene duración y buffer del servicio.
3. El sistema consulta turnos existentes.
4. Calcula horarios libres.
5. Devuelve lista de horarios.

### Reglas

- No requiere `barberId`.
- No mostrar horarios ocupados.
- No mostrar horarios pasados.

---

## CU-10 — Listar turnos

**Actor principal:** Admin  
**Objetivo:** Ver los turnos registrados.

### Flujo principal

1. El admin ingresa al panel privado.
2. El sistema consulta turnos.
3. Devuelve turnos con cliente y servicio.

---

## CU-11 — Ver detalle de turno

**Actor principal:** Admin  
**Objetivo:** Consultar información completa de un turno.

### Flujo principal

1. El admin selecciona un turno.
2. El sistema busca los datos.
3. Devuelve cliente, servicio, fecha, hora y estado.

---

## CU-12 — Confirmar turno

**Actor principal:** Admin  
**Objetivo:** Confirmar una reserva pendiente.

### Flujo principal

1. El admin selecciona un turno pendiente.
2. El sistema cambia estado a `confirmed`.
3. Devuelve confirmación.

---

## CU-13 — Cancelar turno

**Actor principal:** Admin  
**Objetivo:** Cancelar un turno.

### Flujo principal

1. El admin selecciona un turno.
2. El sistema cambia estado a `cancelled`.
3. El horario queda disponible para nuevas reservas.

---

## CU-14 — Completar turno

**Actor principal:** Admin  
**Objetivo:** Registrar que el servicio fue realizado.

### Flujo principal

1. El admin selecciona un turno.
2. El sistema cambia estado a `completed`.
3. Guarda el cambio.

---

## CU-15 — Marcar turno como ausente

**Actor principal:** Admin  
**Objetivo:** Registrar que el cliente no asistió.

### Flujo principal

1. El admin selecciona un turno.
2. El sistema cambia estado a `no_show`.
3. Guarda el cambio.

---

# Casos fuera del MVP

No implementar todavía:

- Registrar usuarios públicos.
- Crear barberos.
- Listar barberos.
- Editar barberos.
- Configurar disponibilidad por barbero.
- Clientes con login.
- Historial avanzado de clientes.
- Pagos.
- Notificaciones.
- Dashboard avanzado.
- Roles complejos.

---

# Trazabilidad MVP

| Caso de Uso | Endpoint / Acción |
|---|---|
| CU-01 Iniciar sesión como admin | POST /api/auth/login |
| CU-02 Obtener perfil autenticado | GET /api/profiles/me |
| CU-03A Gestionar configuración general | GET/PUT /api/settings/general |
| CU-03 Crear servicio | POST /api/services |
| CU-04 Listar servicios activos | GET /api/services |
| CU-05 Editar servicio | PUT /api/services/:id |
| CU-06 Activar/desactivar servicio | PATCH /api/services/:id/status |
| CU-07 Crear o reutilizar cliente | Interno desde creación admin o confirmación |
| CU-08 Reservar turno público | POST /api/appointments/public |
| CU-09 Consultar horarios disponibles | GET /api/available-slots |
| CU-10 Listar turnos | GET /api/appointments |
| CU-11 Ver detalle de turno | GET /api/appointments/:id |
| CU-12 Confirmar turno | PATCH /api/appointments/:id/confirm |
| CU-13 Cancelar turno | PATCH /api/appointments/:id/cancel |
| CU-14 Completar turno | PATCH /api/appointments/:id/complete |
| CU-15 Marcar ausente | PATCH /api/appointments/:id/no-show |
