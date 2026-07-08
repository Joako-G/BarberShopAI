# SDD — Configuración de Calendario de Excepciones

## Objetivo

Implementar una nueva subsección dentro de **Configuración** llamada **Calendario**, encargada de administrar excepciones al horario laboral habitual.

El objetivo es permitir que el administrador configure días específicos donde el negocio permanezca cerrado, tenga horarios especiales o se encuentre de vacaciones, sin modificar la configuración semanal.

Esta funcionalidad debe funcionar para cualquier rubro:

* Barberías
* Salones de uñas
* Centros de estética
* Consultorios
* Talleres
* Estudios profesionales
* Cualquier negocio que trabaje con turnos.

---

# Alcance

Implementar:

* Bloqueos de días completos.
* Horarios especiales para un día específico.
* Bloqueos por rango de fechas (vacaciones).
* Integración con `available-slots`.
* Gestión completa desde el panel administrativo.

No implementar todavía:

* Repetición anual automática.
* Sincronización con Google Calendar.
* Importación de feriados nacionales.
* Eventos recurrentes.

---

# Modelo de datos

Crear tabla:

```sql
calendar_exceptions
```

Campos sugeridos:

```sql
id uuid primary key default gen_random_uuid(),

type text not null,

title text not null,

start_date date not null,

end_date date not null,

is_closed boolean not null default true,

special_start_time time,

special_end_time time,

notes text,

created_at timestamptz default now(),

updated_at timestamptz default now()
```

---

# Tipos de excepción

## CLOSED_DAY

Cierra completamente un único día.

Ejemplo:

```txt
25/12/2026
Navidad
```

---

## SPECIAL_HOURS

Reemplaza el horario laboral para una fecha.

Ejemplo:

```txt
24/12/2026

09:00 - 13:00

Nochebuena
```

---

## VACATION

Bloquea un rango de fechas.

Ejemplo:

```txt
10/01/2027

20/01/2027

Vacaciones
```

---

# Reglas

## CLOSED_DAY

Debe devolver:

```txt
[]
```

como horarios disponibles.

---

## SPECIAL_HOURS

Debe ignorar el horario semanal y utilizar:

```txt
special_start_time

special_end_time
```

---

## VACATION

Todas las fechas comprendidas entre:

```txt
start_date

end_date
```

deben devolver:

```txt
[]
```

---

# Backend

Extender módulo:

```txt
settings
```

Archivos sugeridos:

```txt
calendarExceptions.routes.ts

calendarExceptions.controller.ts

calendarExceptions.service.ts

calendarExceptions.repository.ts

calendarExceptions.schemas.ts

calendarExceptions.types.ts
```

---

# Endpoints

## Obtener excepciones

```http
GET /api/settings/calendar
```

---

## Crear excepción

```http
POST /api/settings/calendar
```

---

## Actualizar excepción

```http
PUT /api/settings/calendar/:id
```

---

## Eliminar excepción

```http
DELETE /api/settings/calendar/:id
```

Todos protegidos con:

```ts
authenticate

requireRole("admin")
```

---

# Validaciones

## title

* requerido
* máximo 80 caracteres

## type

Valores permitidos:

```txt
CLOSED_DAY

SPECIAL_HOURS

VACATION
```

## start_date

Requerido.

## end_date

Debe ser mayor o igual que start_date.

## SPECIAL_HOURS

Debe validar:

```txt
special_start_time < special_end_time
```

## CLOSED_DAY

No debe permitir horarios.

## VACATION

No debe permitir horarios.

---

# Integración con available-slots

Antes de calcular horarios disponibles:

## Paso 1

Buscar excepción para la fecha solicitada.

---

## Paso 2

Si existe:

### CLOSED_DAY

```txt
return []
```

---

### VACATION

```txt
return []
```

---

### SPECIAL_HOURS

Utilizar:

```txt
special_start_time

special_end_time
```

para generar los horarios.

---

## Paso 3

Si no existe excepción:

Continuar utilizando los horarios laborales configurados.

---

# Frontend

Agregar nueva pestaña:

```txt
General

Horarios laborales

Turnos

Apariencia

Calendario
```

---

# Componentes

```txt
CalendarExceptionsPage

CalendarExceptionForm

CalendarExceptionsTable

calendarApi.ts

calendarSchema.ts

calendarTypes.ts
```

---

# Tabla

Mostrar:

* Tipo
* Título
* Fecha inicio
* Fecha fin
* Horario especial
* Estado
* Acciones

---

# Formulario

Campos:

Tipo

```txt
Día cerrado

Horario especial

Vacaciones
```

Título

Fecha inicio

Fecha fin

Si es:

```txt
Horario especial
```

mostrar:

```txt
Hora inicio

Hora fin
```

Botones:

Guardar

Cancelar

---

# UX

Si el tipo cambia:

## Día cerrado

Ocultar horarios.

---

## Vacaciones

Ocultar horarios.

---

## Horario especial

Mostrar horarios.

---

# Criterios de aceptación

La implementación se considera completa cuando:

* Existe la tabla `calendar_exceptions`.
* El admin puede crear excepciones.
* El admin puede editarlas.
* El admin puede eliminarlas.
* Se muestran en una tabla.
* Los datos quedan persistidos.
* `available-slots` consulta primero las excepciones.
* Un día cerrado devuelve `[]`.
* Vacaciones devuelven `[]`.
* Horarios especiales reemplazan el horario semanal.
* No se rompe la configuración de horarios laborales.
* No se rompe la configuración de turnos.
* No se rompe dashboard, clientes, servicios ni reservas públicas.

---

# Notas de arquitectura

Mantener la arquitectura existente.

Separar correctamente:

* API
* Repository
* Service
* Controller
* Schema
* Types
* Componentes
* Formularios

No duplicar lógica de horarios.

Toda la lógica de prioridad entre:

* Excepciones
* Horarios laborales
* Configuración de turnos

debe centralizarse en el servicio que calcula `available-slots`.   