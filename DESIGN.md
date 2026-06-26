---
name: Aura Management System
colors:
  surface: '#f5faff'
  surface-dim: '#d5dbdf'
  surface-bright: '#f5faff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4f9'
  surface-container: '#e9eef3'
  surface-container-high: '#e4e9ee'
  surface-container-highest: '#dee3e8'
  on-surface: '#171c20'
  on-surface-variant: '#3f484f'
  inverse-surface: '#2b3135'
  inverse-on-surface: '#ecf1f6'
  outline: '#6f7880'
  outline-variant: '#bfc7d0'
  surface-tint: '#006590'
  primary: '#006590'
  on-primary: '#ffffff'
  primary-container: '#6ec6ff'
  on-primary-container: '#005176'
  inverse-primary: '#88ceff'
  secondary: '#455f87'
  on-secondary: '#ffffff'
  secondary-container: '#b5d0fd'
  on-secondary-container: '#3e5980'
  tertiary: '#735c00'
  on-tertiary: '#ffffff'
  tertiary-container: '#e1b935'
  on-tertiary-container: '#5e4a00'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#c8e6ff'
  primary-fixed-dim: '#88ceff'
  on-primary-fixed: '#001e2f'
  on-primary-fixed-variant: '#004c6e'
  secondary-fixed: '#d5e3ff'
  secondary-fixed-dim: '#adc8f5'
  on-secondary-fixed: '#001c3b'
  on-secondary-fixed-variant: '#2d486d'
  tertiary-fixed: '#ffe087'
  tertiary-fixed-dim: '#ebc23e'
  on-tertiary-fixed: '#241a00'
  on-tertiary-fixed-variant: '#574500'
  background: '#f5faff'
  on-background: '#171c20'
  surface-variant: '#dee3e8'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  button:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 40px
  xl: 64px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 48px
---

## Brand & Style
The design system is engineered for efficiency, clarity, and a premium "high-end service" feel. It translates the energy of the Argentina National Team palette into a sophisticated SaaS context, avoiding athletic tropes in favor of professional elegance. 

The aesthetic sits at the intersection of **Corporate Modern** and **Glassmorphism**. It utilizes expansive white space, subtle translucent layers, and high-quality typography to evoke a sense of calm and control. The emotional response should be one of "effortless organization"—making complex scheduling and client management feel light and manageable.

## Colors
The palette uses a hierarchical approach to ensure functional clarity:
- **Primary (Sky Blue):** Used for primary actions, focus states, and progress indicators. It provides a fresh, optimistic energy.
- **Secondary (Deep Blue):** Used for sidebars, primary navigation text, and high-contrast components to ground the interface.
- **Accent (Gold):** Reserved for "premium" features, special notifications, or high-priority badges.
- **Background & Surface:** The UI relies on a "Very Light Blue" background to reduce eye strain compared to pure white, while "White" surfaces are used for cards and workspace modules to create clear content separation.

## Typography
This design system utilizes **Inter** for all primary interface elements to ensure maximum legibility and a modern, neutral feel. **JetBrains Mono** is introduced sparingly for labels and metadata (like timestamps or queue numbers) to provide a subtle technical, "managed" aesthetic. 

Headlines use tight letter-spacing and heavy weights to create a strong visual anchor, while body text remains generous in line height to promote readability during long administrative sessions.

## Layout & Spacing
The system employs a **Fluid Grid** with a strict 8px baseline. Content is organized within a 12-column system for desktop, collapsing to a single column for mobile. 

- **Sidebars:** Fixed at 280px on desktop to provide a consistent navigation anchor.
- **Margins:** Large 48px outer margins on desktop create a "boutique" feel, preventing the interface from appearing cluttered.
- **Gutters:** Standardized at 24px to ensure distinct separation between scheduling cards and analytics widgets.

## Elevation & Depth
Depth is created through **Tonal Layering** and **Glassmorphism**, rather than heavy shadows.

- **Level 0 (Background):** Very Light Blue (#F5FAFF).
- **Level 1 (Cards/Workspaces):** White (#FFFFFF) with a 1px border (#E1F0FF) and a very soft, 12% opacity Deep Blue shadow.
- **Level 2 (Modals/Dropdowns):** Pure White with a 20px blur background effect when appearing over content, utilizing a more pronounced shadow to indicate focus.
- **Highlights:** Occasional use of semi-transparent Sky Blue overlays (10-15% opacity) for hover states on list items.

## Shapes
The shape language is consistently rounded to feel approachable and high-end. 
- **Standard Components:** (Buttons, Inputs) Use a 0.5rem (8px) radius.
- **Containers:** (Cards, Modals) Use a 1rem (16px) radius to emphasize the "contained" and safe nature of the data.
- **Avatars:** Always circular to provide a soft contrast to the structured grid.

## Components
- **Buttons:** Primary buttons use a Sky Blue fill with white text. Ghost buttons use a Deep Blue outline for secondary actions.
- **Inputs:** Fields use a White background with a subtle Deep Blue border (10% opacity). On focus, the border transitions to Sky Blue with a 4px soft outer glow.
- **Cards:** The primary container for appointments. They feature a 16px corner radius and a subtle "glass" highlight on the top edge to simulate a physical premium card.
- **Status Chips:** Use highly desaturated versions of Success/Error/Warning colors with a darker text color for a modern, "Linear-style" look.
- **Scheduler Grid:** The heart of the product. It uses thin, Light Blue dividers and a distinct vertical line for the "Current Time," accented in Gold.
- **Navigation:** The sidebar uses the Deep Blue background with Sky Blue active states, creating a high-contrast zone that separates "System Control" from "Content."