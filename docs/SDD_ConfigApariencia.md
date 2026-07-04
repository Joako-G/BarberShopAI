# SDD — Configuración de Apariencia

## Objetivo

Implementar una subsección dentro de **Configuración** para personalizar la apariencia visual del sistema.

El objetivo es que el sistema pueda adaptarse visualmente a distintos rubros sin modificar código.

Ejemplos:

* Barbería: oscuro, dorado, blanco.
* Salón de uñas: rosa suave, blanco, dorado.
* Pestañas: negro, dorado, nude.
* Consultorio: blanco, azul, verde.
* Taller: gris oscuro, naranja, blanco.

---

## Alcance de esta fase

Implementar configuración para:

* Modo visual del sistema.
* Color principal.
* Color secundario.
* Color de acento.
* Color de fondo.
* Color de texto.
* Radio de bordes.
* Vista previa simple del tema.

No implementar todavía:

* Subida de logo.
* Fuentes personalizadas.
* Temas predefinidos avanzados.
* Animaciones configurables.
* Personalización de la landing pública.

---

## Tabla sugerida

Crear tabla `appearance_settings`.

```sql
id uuid primary key default gen_random_uuid(),
theme_mode text not null default 'dark',
primary_color text not null default '#75CFFF',
secondary_color text not null default '#94A3B8',
accent_color text not null default '#D4AF37',
background_color text not null default '#07111F',
text_color text not null default '#F8FAFC',
border_radius int not null default 12,
created_at timestamptz default now(),
updated_at timestamptz default now()
```

Debe existir un único registro de configuración de apariencia.

---

## Valores iniciales sugeridos

```txt
theme_mode: dark
primary_color: #75CFFF
secondary_color: #94A3B8
accent_color: #D4AF37
background_color: #07111F
text_color: #F8FAFC
border_radius: 12
```

---

## Backend

Crear o extender módulo:

```txt
src/features/settings
```

Archivos sugeridos:

```txt
appearanceSettings.routes.ts
appearanceSettings.controller.ts
appearanceSettings.service.ts
appearanceSettings.repository.ts
appearanceSettings.schemas.ts
appearanceSettings.types.ts
```

También puede integrarse al módulo `settings` existente si mantiene la arquitectura actual.

---

## Endpoints

### Obtener configuración de apariencia

```http
GET /api/settings/appearance
```

Protegido para admin.

Respuesta esperada:

```json
{
  "id": "uuid",
  "theme_mode": "dark",
  "primary_color": "#75CFFF",
  "secondary_color": "#94A3B8",
  "accent_color": "#D4AF37",
  "background_color": "#07111F",
  "text_color": "#F8FAFC",
  "border_radius": 12
}
```

---

### Actualizar configuración de apariencia

```http
PUT /api/settings/appearance
```

Protegido para admin.

Body esperado:

```json
{
  "theme_mode": "dark",
  "primary_color": "#75CFFF",
  "secondary_color": "#94A3B8",
  "accent_color": "#D4AF37",
  "background_color": "#07111F",
  "text_color": "#F8FAFC",
  "border_radius": 12
}
```

Respuesta esperada:

```json
{
  "message": "Apariencia actualizada correctamente",
  "settings": {
    "id": "uuid",
    "theme_mode": "dark",
    "primary_color": "#75CFFF",
    "secondary_color": "#94A3B8",
    "accent_color": "#D4AF37",
    "background_color": "#07111F",
    "text_color": "#F8FAFC",
    "border_radius": 12
  }
}
```

---

## Validaciones backend

Usar Zod.

Reglas:

```txt
theme_mode:
- requerido
- valores permitidos: dark, light

primary_color:
- requerido
- formato hexadecimal válido

secondary_color:
- requerido
- formato hexadecimal válido

accent_color:
- requerido
- formato hexadecimal válido

background_color:
- requerido
- formato hexadecimal válido

text_color:
- requerido
- formato hexadecimal válido

border_radius:
- requerido
- número entero
- mínimo 0
- máximo 32
```

Formato hexadecimal válido:

```txt
#000000
#FFFFFF
#75CFFF
```

---

## Seguridad

Los endpoints deben usar:

```ts
authenticate
requireRole("admin")
```

Solo el administrador puede leer y modificar la configuración de apariencia.

---

## Frontend

Agregar dentro de `/settings` una subsección o pestaña llamada:

```txt
Apariencia
```

Si ya existen tabs, debe quedar algo similar a:

```txt
General | Horarios laborales | Turnos | Apariencia
```

---

## Componentes frontend sugeridos

```txt
src/features/settings/components/AppearanceSettingsForm.tsx
src/features/settings/appearanceSettingsApi.ts
src/features/settings/appearanceSettingsTypes.ts
src/features/settings/appearanceSettingsSchema.ts
```

---

## Formulario

Campos:

* Modo visual: `dark` o `light`
* Color principal
* Color secundario
* Color de acento
* Color de fondo
* Color de texto
* Radio de bordes

Inputs sugeridos:

```txt
theme_mode → select
primary_color → input type="color"
secondary_color → input type="color"
accent_color → input type="color"
background_color → input type="color"
text_color → input type="color"
border_radius → input type="number" o slider
```

---

## Vista previa

Agregar una vista previa simple que muestre:

* Una card de ejemplo.
* Un botón primario.
* Un botón secundario.
* Un texto de ejemplo.
* Un pequeño badge o etiqueta usando el color de acento.

La vista previa debe actualizarse al cambiar los colores antes de guardar.

---

## Aplicación del tema

Crear una función o hook para aplicar los colores como CSS variables.

Ejemplo:

```css
:root {
  --color-primary: #75CFFF;
  --color-secondary: #94A3B8;
  --color-accent: #D4AF37;
  --color-bg: #07111F;
  --color-text: #F8FAFC;
  --radius-base: 12px;
}
```

Desde frontend, al cargar la configuración, aplicar:

```ts
document.documentElement.style.setProperty("--color-primary", settings.primary_color);
document.documentElement.style.setProperty("--color-secondary", settings.secondary_color);
document.documentElement.style.setProperty("--color-accent", settings.accent_color);
document.documentElement.style.setProperty("--color-bg", settings.background_color);
document.documentElement.style.setProperty("--color-text", settings.text_color);
document.documentElement.style.setProperty("--radius-base", `${settings.border_radius}px`);
```

---

## Store recomendado

Extender o crear store:

```txt
appearanceSettingsStore
```

Debe guardar:

```ts
appearanceSettings
setAppearanceSettings
clearAppearanceSettings
applyAppearanceSettings
```

También puede integrarse al `settingsStore` existente si la arquitectura actual lo permite.

---

## Comportamiento esperado

Cuando el admin entra a `/settings` y selecciona “Apariencia”:

1. Se consulta `GET /api/settings/appearance`.
2. Se cargan los valores en el formulario.
3. Se aplican los colores al panel.
4. El admin modifica los colores.
5. La vista previa se actualiza antes de guardar.
6. Al guardar, se envía `PUT /api/settings/appearance`.
7. Se muestra mensaje de éxito.
8. Los valores quedan persistidos.
9. Al recargar el sistema, la apariencia se mantiene.

---

## Fallback

Si no existe configuración en `appearance_settings`, usar:

```txt
theme_mode: dark
primary_color: #75CFFF
secondary_color: #94A3B8
accent_color: #D4AF37
background_color: #07111F
text_color: #F8FAFC
border_radius: 12
```

---

## Criterios de aceptación

La implementación se considera completa cuando:

* Existe tabla `appearance_settings`.
* Existe un único registro inicial.
* Existen endpoints protegidos para leer y actualizar apariencia.
* El admin puede editar apariencia desde `/settings`.
* Los cambios se guardan en Supabase.
* Al recargar, los cambios se mantienen.
* La vista previa responde a los cambios antes de guardar.
* El sistema aplica los colores mediante CSS variables.
* El cambio visual no rompe layout ni componentes existentes.
* No se rompe configuración general.
* No se rompe horarios laborales.
* No se rompe configuración de turnos.
* No se rompe dashboard, turnos, clientes ni servicios.
