# SDD — Configuración de Horarios Laborales

## Objetivo

Implementar una nueva subsección dentro de **Configuración** para administrar los horarios laborales del negocio.

El objetivo es reemplazar los horarios fijos definidos en código por horarios configurables desde el panel admin.

Actualmente el sistema usa constantes similares a:

```ts
WORK_START_MINUTES
WORK_END_MINUTES
SLOT_INTERVAL_MINUTES
```

En esta fase se debe permitir configurar qué días trabaja el negocio y en qué horario.

---

## Alcance de esta fase

Implementar:

* Gestión de horarios laborales por día de la semana.
* Lectura de horarios desde backend.
* Actualización de horarios desde el panel admin.
* Persistencia en Supabase.
* Uso de los horarios configurados en `available-slots`.

No implementar todavía:

* Colores del sistema.
* Personalización visual avanzada.
* Mensajes personalizados.
* Feriados o cierres excepcionales.
* Horarios partidos, por ejemplo 09:00 a 13:00 y 17:00 a 21:00.

---

## Tabla sugerida

Crear tabla `business_hours`.

```sql
id uuid primary key default gen_random_uuid(),
day_of_week int not null,
is_open boolean not null default true,
start_time time,
end_time time,
created_at timestamptz default now(),
updated_at timestamptz default now()
```

Reglas:

```txt
day_of_week:
0 = domingo
1 = lunes
2 = martes
3 = miércoles
4 = jueves
5 = viernes
6 = sábado
```

Debe existir un registro por cada día de la semana.

---

## Valores iniciales sugeridos

```txt
Domingo: cerrado
Lunes: 09:00 - 22:00
Martes: 09:00 - 22:00
Miércoles: 09:00 - 22:00
Jueves: 09:00 - 22:00
Viernes: 09:00 - 22:00
Sábado: 09:00 - 22:00
```

---

## Backend

Crear o extender el módulo:

```txt
src/features/settings
```

Archivos sugeridos:

```txt
businessHours.routes.ts
businessHours.controller.ts
businessHours.service.ts
businessHours.repository.ts
businessHours.schemas.ts
businessHours.types.ts
```

También puede integrarse dentro del módulo `settings` existente si la arquitectura actual lo permite.

---

## Endpoints

### Obtener horarios laborales

```http
GET /api/settings/business-hours
```

Protegido para admin.

Respuesta esperada:

```json
[
  {
    "id": "uuid",
    "day_of_week": 0,
    "is_open": false,
    "start_time": null,
    "end_time": null
  },
  {
    "id": "uuid",
    "day_of_week": 1,
    "is_open": true,
    "start_time": "09:00",
    "end_time": "22:00"
  }
]
```

---

### Actualizar horarios laborales

```http
PUT /api/settings/business-hours
```

Protegido para admin.

Body esperado:

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

Respuesta esperada:

```json
{
  "message": "Horarios laborales actualizados correctamente",
  "hours": []
}
```

---

## Validaciones backend

Usar Zod.

Reglas:

* Deben enviarse exactamente 7 días.
* `day_of_week` debe estar entre 0 y 6.
* No puede haber días repetidos.
* Si `is_open` es `false`, `start_time` y `end_time` pueden ser `null`.
* Si `is_open` es `true`, `start_time` y `end_time` son requeridos.
* `start_time` debe ser menor que `end_time`.
* El formato debe ser `HH:MM`.
* No permitir horarios fuera de un día válido.
* No permitir `end_time` mayor a `23:59`.

---

## Integración con available-slots

Modificar la lógica de slots disponibles para que:

1. Reciba `serviceId` y `date`.
2. Calcule el día de la semana de esa fecha.
3. Busque el horario laboral correspondiente.
4. Si el negocio está cerrado ese día, devolver `[]`.
5. Si está abierto, generar slots entre `start_time` y `end_time`.
6. Mantener la lógica actual de:

   * Duración del servicio.
   * Buffer.
   * Bloqueo por turnos pending.
   * Bloqueo por turnos confirmed.
   * Validación de superposición.

No eliminar la lógica actual de validación de turnos. Solo reemplazar el origen del horario laboral.

---

## Fallback temporal

Si por algún motivo no existen registros en `business_hours`, usar fallback:

```txt
Lunes a sábado: 09:00 - 22:00
Domingo: cerrado
```

Esto evita que el sistema se rompa si falta la configuración inicial.

---

## Frontend

Agregar dentro de `/settings` una subsección o pestaña llamada:

```txt
Horarios laborales
```

Opciones posibles:

* Tabs: General | Horarios laborales
* Cards separadas dentro de la misma página

Elegir la opción que mejor se adapte a la arquitectura actual.

---

## Componentes frontend sugeridos

```txt
src/features/settings/components/BusinessHoursForm.tsx
src/features/settings/businessHoursApi.ts
src/features/settings/businessHoursTypes.ts
src/features/settings/businessHoursSchema.ts
```

---

## Formulario

Mostrar los 7 días de la semana.

Por cada día:

* Nombre del día.
* Switch o checkbox “Abierto”.
* Input hora inicio.
* Input hora cierre.

Comportamiento:

* Si el día está cerrado, deshabilitar inputs de horario.
* Si el día está abierto, requerir horario inicio y cierre.
* Mostrar errores claros si el horario es inválido.
* Botón “Guardar horarios”.
* Estado de loading.
* Estado de guardando.
* Mensaje de éxito.
* Mensaje de error.

---

## Criterios de aceptación

La implementación se considera completa cuando:

* Existe tabla `business_hours`.
* Existen 7 registros iniciales.
* El admin puede ver los horarios laborales.
* El admin puede modificar horarios por día.
* Los horarios se guardan en Supabase.
* Al recargar, los horarios se mantienen.
* `available-slots` usa los horarios configurados.
* Si un día está cerrado, `available-slots` devuelve `[]`.
* Si se cambia el horario de cierre, los slots se ajustan.
* No se rompe la creación de turnos.
* No se rompe dashboard, clientes, servicios ni configuración general.
* Las validaciones funcionan en backend y frontend.
