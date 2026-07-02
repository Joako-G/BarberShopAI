# SDD — Sección Configuración General

## Objetivo

Implementar una nueva sección llamada **Configuración** dentro del panel admin del sistema de gestión de turnos.

En esta primera fase solo se debe implementar la subsección **General**, encargada de permitir modificar los datos principales del negocio/sistema.

El objetivo es que el sistema pueda adaptarse fácilmente a distintos rubros, por ejemplo barbería, uñas, pestañas, consultorios, talleres, etc.

---

## Alcance de esta fase

Implementar únicamente:

* Página `/settings`
* Formulario de configuración general
* Lectura de configuración desde backend
* Actualización de configuración
* Persistencia en Supabase
* Uso del nombre del sistema en el panel admin

No implementar todavía:

* Horarios laborales
* Colores/tema visual
* Configuración avanzada de turnos
* Mensajes personalizados
* Redes sociales
* Logo con subida de archivo

---

## Datos de configuración general

Crear una tabla en Supabase llamada `business_settings`.

Campos sugeridos:

```sql
id uuid primary key default gen_random_uuid(),
system_name text not null,
business_name text not null,
business_type text,
description text,
phone text,
whatsapp text,
email text,
address text,
created_at timestamptz default now(),
updated_at timestamptz default now()
```

Debe existir un único registro de configuración general para el sistema.

---

## Valores iniciales sugeridos

Crear un registro inicial con datos genéricos:

```txt
system_name: Sistema de Turnos
business_name: Mi Negocio
business_type: Barbería
description: Sistema para gestionar turnos, clientes y servicios.
phone: vacío
whatsapp: vacío
email: vacío
address: vacío
```

---

## Backend

Crear una nueva feature o módulo:

```txt
src/features/settings
```

Estructura sugerida:

```txt
settings.routes.ts
settings.controller.ts
settings.service.ts
settings.repository.ts
settings.schemas.ts
settings.types.ts
```

---

## Endpoints

### Obtener configuración general

```http
GET /api/settings/general
```

Debe estar protegido para admin.

Respuesta esperada:

```json
{
  "id": "uuid",
  "system_name": "Sistema de Turnos",
  "business_name": "Mi Negocio",
  "business_type": "Barbería",
  "description": "Sistema para gestionar turnos, clientes y servicios.",
  "phone": "",
  "whatsapp": "",
  "email": "",
  "address": ""
}
```

---

### Actualizar configuración general

```http
PUT /api/settings/general
```

Debe estar protegido para admin.

Body esperado:

```json
{
  "system_name": "BarberPro",
  "business_name": "Barbería El Corte",
  "business_type": "Barbería",
  "description": "Turnos online para barbería.",
  "phone": "3880000000",
  "whatsapp": "3880000000",
  "email": "contacto@barberia.com",
  "address": "San Salvador de Jujuy"
}
```

Respuesta esperada:

```json
{
  "message": "Configuración actualizada correctamente",
  "settings": {
    "id": "uuid",
    "system_name": "BarberPro",
    "business_name": "Barbería El Corte",
    "business_type": "Barbería",
    "description": "Turnos online para barbería.",
    "phone": "3880000000",
    "whatsapp": "3880000000",
    "email": "contacto@barberia.com",
    "address": "San Salvador de Jujuy"
  }
}
```

---

## Validaciones backend

Usar Zod.

Reglas:

```txt
system_name:
- requerido
- mínimo 2 caracteres
- máximo 60 caracteres

business_name:
- requerido
- mínimo 2 caracteres
- máximo 80 caracteres

business_type:
- opcional
- máximo 60 caracteres

description:
- opcional
- máximo 300 caracteres

phone:
- opcional
- máximo 30 caracteres

whatsapp:
- opcional
- máximo 30 caracteres

email:
- opcional
- debe ser email válido si existe

address:
- opcional
- máximo 150 caracteres
```

Los campos opcionales pueden guardarse como `null` o string vacío, pero mantener un criterio consistente.

---

## Seguridad

Los endpoints deben usar:

```ts
authenticate
requireRole("admin")
```

Solo el administrador puede leer y modificar la configuración general.

---

## Frontend

Crear nueva página:

```txt
src/pages/settings/SettingsPage.tsx
```

Crear componentes:

```txt
src/features/settings/components/GeneralSettingsForm.tsx
```

Crear API:

```txt
src/features/settings/settingsApi.ts
```

Crear tipos:

```txt
src/features/settings/settingsTypes.ts
```

Crear schema Zod frontend:

```txt
src/features/settings/settingsSchema.ts
```

---

## Ruta frontend

Agregar ruta protegida:

```tsx
/settings
```

Debe aparecer en el Sidebar como:

```txt
Configuración
```

---

## Formulario

Campos del formulario:

* Nombre del sistema
* Nombre del negocio
* Rubro
* Descripción
* Teléfono
* WhatsApp
* Email
* Dirección

Botones:

* Guardar cambios
* Cancelar cambios

Estados:

* Loading inicial
* Guardando cambios
* Error al cargar configuración
* Error al guardar configuración
* Mensaje de éxito

---

## Comportamiento esperado

Cuando el admin entra a `/settings`:

1. Se consulta `GET /api/settings/general`.
2. Se cargan los valores en el formulario.
3. El usuario edita los campos.
4. Al presionar “Guardar cambios”, se envía `PUT /api/settings/general`.
5. Si la respuesta es correcta, mostrar mensaje de éxito.
6. Si hay error, mostrar mensaje claro.
7. El botón debe deshabilitarse mientras guarda.

---

## Uso del nombre del sistema

Luego de obtener la configuración general, usar `system_name` para reemplazar textos fijos como:

```txt
Sistema de Turnos
```

Por ejemplo en:

* Header
* Sidebar
* Título principal del dashboard

Si todavía no hay configuración cargada, usar fallback:

```txt
Sistema de Turnos
```

---

## Recomendación de store

Crear un store simple con Zustand:

```txt
settingsStore
```

Debe guardar:

```ts
settings
setSettings
clearSettings
```

Esto permitirá reutilizar `system_name` y otros datos en distintas partes del panel.

No usar persist por ahora, salvo que ya sea necesario para evitar recargas innecesarias.

---

## Criterios de aceptación

La implementación se considera completa cuando:

* Existe la ruta `/settings`.
* El sidebar muestra “Configuración”.
* El admin puede ver la configuración general.
* El admin puede modificar y guardar los datos.
* Los datos quedan persistidos en Supabase.
* Al recargar la página, se mantienen los cambios.
* El nombre del sistema se muestra en el panel.
* Los endpoints están protegidos por autenticación y rol admin.
* Las validaciones funcionan tanto en frontend como en backend.
* No se rompe dashboard, turnos, clientes ni servicios.

---

## Notas importantes

Mantener la arquitectura actual del proyecto.

No poner toda la lógica dentro del componente.

Separar:

* API
* tipos
* schema
* formulario
* página

No modificar todavía la lógica de horarios ni available-slots.

Esta fase solo corresponde a **Configuración General**.
