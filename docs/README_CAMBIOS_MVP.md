# Cambios aplicados a la documentación

Estos archivos adaptan el proyecto a un MVP de barbería unipersonal.

## Archivo nuevo

- `MVP_UNIPERSONAL_SDD.md`

Este archivo debe ser la nueva fuente principal de verdad para el alcance actual.

## Archivos reemplazados/adaptados

- `ROADMAP.md`
- `API_SPEC.md`
- `BUSINESS_RULES.md`
- `DATABASE_RULE.md`
- `SECURITY.md`
- `USE_CASES/USE_CASES.md`
- `ARCHITECTURE/MODULE_REFACTOR.md`

## Decisión principal

El sistema deja de priorizar:

- Múltiples barberos.
- Clientes con login.
- Registro público de usuarios.
- Pagos.
- Notificaciones.
- Dashboard avanzado.

Y pasa a priorizar:

- Login del admin/dueño.
- Servicios.
- Clientes sin login.
- Reservas públicas.
- Gestión de turnos.

## Recomendación

Guardar los documentos anteriores en una carpeta:

```txt
docs/archive/
```

Y usar estos nuevos documentos como documentación activa del MVP.
