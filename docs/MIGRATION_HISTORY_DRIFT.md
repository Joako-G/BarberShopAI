# Migration History Drift

Fecha de registro: 2026-07-02

## Contexto

Antes de usar Supabase MCP, algunos cambios de esquema se aplicaron manualmente en la base remota. Por eso existe una diferencia entre los archivos locales de `supabase/migrations/` y la tabla de migraciones registrada por Supabase.

## Estado observado

Migraciones registradas en Supabase remoto al momento de esta nota:

- `20260702002116_create_business_settings_general`
- `20260702114500_create_business_hours`

Migraciones locales existentes que pueden representar cambios aplicados manualmente o historial no registrado:

- `20260625_atomic_appointment_booking.sql`
- `20260625_atomic_customer_and_status.sql`
- `20260625_restrict_direct_table_access.sql`
- `20260626_public_guest_booking.sql`
- `20260702_business_settings.sql`
- `20260702_business_hours.sql`

## Riesgo

La aplicacion puede funcionar si el esquema remoto real coincide con lo que necesita el backend, pero una sincronizacion estricta con Supabase CLI podria intentar aplicar migraciones locales que ya fueron aplicadas manualmente. Eso podria fallar por objetos existentes, constraints duplicadas, funciones existentes o permisos ya configurados.

## Decision actual

No se reordena ni se repara el historial en esta implementacion. Para el SDD de horarios laborales solo se agrego y aplico la migracion nueva `create_business_hours`.

## Recomendacion futura

Crear una tarea separada para reconciliar el historial:

1. Comparar esquema remoto contra migraciones locales.
2. Definir si se crea una baseline o si se ajusta el historial local.
3. Evitar aplicar migraciones antiguas sobre remoto sin revisar objeto por objeto.
