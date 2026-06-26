# AGENTS.md — BarberShop

# Purpose

This file defines how AI agents must work inside this repository.

Agents must follow these rules before implementing, modifying, refactoring, or reviewing any code.

Project documentation is considered the source of truth.

---

# Project Overview

BarberShop is a fullstack appointment booking platform for barbershops.

Technology Stack:

Frontend:

* React
* TypeScript
* Tailwind CSS
* React Router

Backend:

* Node.js
* Express
* TypeScript

Database:

* Supabase PostgreSQL

---

# Repository Structure

```text
BarberShop/
│
├── AGENTS.md
│
├── docs/
│   ├── BUSINESS_RULES.md
│   ├── DATABASE_SCHEMA.md
│   ├── API_SPEC.md
│   ├── SECURITY.md
│   ├── UI_GUIDELINES.md
│   └── ROADMAP.md
│
├── frontend/
│
└── backend/
```

# Current Backend Architecture

The backend uses a modular architecture.

Current structure:

```text
src/
├── config/
├── middlewares/
├── modules/
│   ├── appointments/
│   │   ├── controllers/
│   │   ├── repositories/
│   │   ├── routes/
│   │   ├── types/
│   │   ├── use-cases/
│   │   └── index.ts
│   ├── auth/
│   ├── barbers/
│   ├── customers/
│   ├── dashboard/
│   ├── profiles/
│   └── services/
├── routes/
├── shared/
├── app.ts
└── server.ts
```

# Current Frontend Architecture

Current structure:

```text
src/
├── assets/
├── components/
│   ├── appointments/
│   ├── customers/
│   ├── layout/
│   └── services/
├── hooks/
├── layouts/
├── pages/
├── routes/
├── schemas/
├── services/
├── store/
├── types/
├── App.tsx
└── main.tsx
```

Rules:

Before creating files:

- Search existing components.
- Search existing hooks.
- Search existing services.
- Search existing schemas.
- Search existing stores.
- Search existing types.

Avoid duplicate implementations.


Rules:

- New features must follow the modular architecture.
- Do not create root-level controllers outside modules.
- Do not create root-level repositories outside modules.
- Do not create root-level use-cases outside modules.
- Reuse existing module structure.
- Respect module boundaries.

---

# Documentation Rules

Documentation is the source of truth.

Before implementing any feature, agents must consult the relevant documentation.

Documentation location:

```text
docs/
```

Available documents:

* BUSINESS_RULES.md
* DATABASE_SCHEMA.md
* API_SPEC.md
* SECURITY.md
* UI_GUIDELINES.md
* ROADMAP.md

---

# Documentation Priority

Business logic:
→ BUSINESS_RULES.md

Database structure:
→ DATABASE_SCHEMA.md

API behavior:
→ API_SPEC.md

Security requirements:
→ SECURITY.md

UI and UX:
→ UI_GUIDELINES.md

Project roadmap:
→ ROADMAP.md

# Business Rules Source Of Truth

For appointment-related changes:

Always review:

- BUSINESS_RULES.md
- API_SPEC.md
- DATABASE_SCHEMA.md

Appointment rules take precedence over implementation convenience.

Do not modify appointment status transitions without explicit approval.

---

# Mandatory Workflow

Before writing code:

1. Read AGENTS.md
2. Read relevant documentation
3. Explain consulted documents
4. Explain affected modules
5. Explain implementation plan
6. Implement
7. Verify consistency

Do not skip these steps.

---

# Planning Requirements

For any feature larger than a simple bug fix:

Agents must:

1. Analyze requirements.
2. Identify impacted modules.
3. Identify impacted database tables.
4. Identify impacted API endpoints.
5. Identify impacted business rules.
6. Present implementation plan.

Do not immediately generate code.

# Mandatory Planning Workflow

Before writing code:

1. Read AGENTS.md
2. Read relevant documentation
3. Analyze impacted modules
4. Analyze impacted database tables
5. Analyze impacted endpoints
6. Analyze impacted business rules
7. Present implementation plan

For medium and large features:

DO NOT START CODING IMMEDIATELY.

Wait for approval after presenting the plan.

---

# Architecture Protection

Preserve project architecture.

Do not:

* Move files unnecessarily.
* Rename folders without justification.
* Rewrite working code without reason.
* Introduce new architectural patterns without approval.

Follow existing project conventions.

---

# Frontend Architecture

Frontend structure:

```text
frontend/src/
│
├── pages/
├── components/
├── hooks/
├── services/
├── routes/
├── contexts/
├── types/
├── utils/
└── assets/
```

---

# Frontend Rules

Use:

* Functional Components
* TypeScript
* React Hooks
* Composition Pattern

Avoid:

* Class Components
* Massive components
* Unnecessary state duplication

# React Performance Rules

Prefer:

- Functional Components
- Composition
- Reusable Components
- Controlled Forms
- Custom Hooks

Avoid:

- Massive Components
- Deep Prop Drilling
- Unnecessary Global State
- Premature Optimization

Performance Rules:

- Avoid unnecessary re-renders.
- Use useMemo only when justified.
- Use useCallback only when justified.
- Keep components focused.
- Separate UI from business logic.

# Zustand Rules

Use Zustand only for global state.

Current Stores:

- authStore

Rules:

- Do not duplicate server state unnecessarily.
- Do not move local component state into Zustand without justification.
- Prefer component state for UI-only concerns.
- Keep stores small and focused.
- Use persist only when required.

# Axios Rules

All HTTP requests must go through centralized services.

Examples:

- authService
- customerService
- appointmentService
- serviceService

Rules:

- Do not create axios instances inside components.
- Do not call APIs directly inside JSX.
- Handle loading states.
- Handle error states.
- Handle success states.
- Keep API logic separated from UI logic.

# Validation Rules (Zod)

Frontend forms must use:

- React Hook Form
- Zod

Rules:

- Validation messages must be in Spanish.
- Never duplicate validation logic.
- Reuse schemas whenever possible.
- Validate all user input.

---

# Component Rules

Components should have a single responsibility.

Preferred:

```text
BookingPage
 ├── ServiceSelector
 ├── BarberSelector
 ├── DateSelector
 └── TimeSlotSelector
```

Avoid components larger than 300 lines.

Split responsibilities when complexity increases.

---

# Styling Rules

Use Tailwind CSS.

Avoid:

* Inline styles
* CSS-in-JS
* Repeated utility combinations

Prefer reusable UI components.

---

# TypeScript Rules

Avoid:

```ts
any
```

unless absolutely necessary.

Always type:

* Props
* Responses
* Hooks
* Contexts
* Services

Prefer:

* interfaces
* types
* generics

---

# Backend Architecture

Backend structure:

```text
backend/src/
│
├── config/
├── controllers/
├── services/
├── repositories/
├── routes/
├── middlewares/
├── types/
├── utils/
├── app.ts
└── server.ts
```

---

# Backend Responsibility Rules

Controllers:

* Receive requests
* Validate input
* Call services
* Return responses

Controllers must remain thin.

---

Services:

Contain all business logic.

Examples:

* Availability calculation
* Appointment validation
* Conflict detection
* Authorization logic

---

Repositories:

Contain database access only.

Repositories must:

* Read data
* Insert data
* Update data
* Delete data

Repositories must not contain business logic.

---

# Database Rules

Use Supabase as the only database provider.

Avoid duplicated information.

Use foreign keys whenever possible.

Respect the schema defined in DATABASE_SCHEMA.md.

Do not modify tables without documenting changes.

---

# Appointment Rules

Appointments cannot overlap.

Conflict formula:

existing.start < new.end

AND

existing.end > new.start

This validation is mandatory before creating appointments.

# Appointment Status Rules

Valid statuses:

- pending
- confirmed
- completed
- cancelled
- no_show

Allowed transitions:

pending -> confirmed
pending -> cancelled

confirmed -> completed
confirmed -> cancelled
confirmed -> no_show

completed -> no transitions

cancelled -> no transitions

no_show -> no transitions

# Appointment Business Rules

Appointments cannot overlap.

Conflict formula:

existing.start < new.end

AND

existing.end > new.start

Rules:

- pending blocks availability
- confirmed blocks availability
- cancelled releases availability
- completed represents finished appointments
- no_show only allowed from confirmed

Available slots must be generated dynamically.

Never store available slots.

Sunday returns no available slots.

Available slots depend on:

- Service duration
- Service buffer
- Existing appointments
- Working hours

---

# Availability Rules

Available slots must never be stored.

Available slots must be calculated dynamically using:

* Service duration
* Service buffer
* Existing appointments
* Barber working hours

---

# Service Rules

Each service contains:

* duration_minutes
* buffer_minutes

Total occupied time:

duration_minutes + buffer_minutes

Appointment end time must include buffer time.

---

# API Rules

Use REST conventions.

Examples:

GET /services

GET /services/:id

POST /services

PUT /services/:id

DELETE /services/:id

Use proper HTTP status codes.

---

# Validation Rules

All external input must be validated.

Validate:

* Body
* Params
* Query strings

Preferred library:

* Zod

Never trust frontend input.

---

# Security Rules

Security is mandatory.

Security takes precedence over implementation speed.

---

## Authentication

Never trust frontend authentication.

Protected endpoints must validate identity on the backend.

---

## Authorization

Always validate permissions.

Examples:

* Customers cannot access admin routes.
* Barbers cannot manage services.
* Admins have full access.

---

## Secrets

Never expose:

* Service Role Keys
* API Keys
* Passwords
* JWT Secrets
* Tokens

Use environment variables.

---

## Sensitive Data

Never expose:

* Password hashes
* Internal configuration
* Secrets
* Private user data

Return only necessary information.

---

## Input Security

Validate all external input.

Sanitize data when appropriate.

Reject malformed payloads.

---

## SQL Injection

Never build queries using string concatenation.

Always use Supabase SDK or parameterized queries.

---

## Logging

Never log:

* Passwords
* Access tokens
* Refresh tokens
* Secrets

Use structured logging.

---

## Error Handling

Never expose stack traces.

Bad:

Database connection failed at line 127.

Good:

An unexpected error occurred.

---

## Rate Limiting

Authentication endpoints should support rate limiting.

Protect against brute force attacks.

---

## Dependency Security

Prefer actively maintained packages.

Avoid unnecessary dependencies.

Review security implications before adding packages.

---

## Principle of Least Privilege

Grant only the minimum permissions required.

Avoid unnecessary administrative access.

---

# Refactoring Rules

When modifying code:

* Preserve behavior.
* Avoid unnecessary rewrites.
* Keep changes focused.
* Maintain compatibility.

---

# Documentation Rules

When implementing features:

Explain:

1. What was changed.
2. Why it was changed.
3. Affected files.
4. Affected database tables.
5. Affected endpoints.
6. Security implications.

---

# Quality Standards

Every implementation must be:

* Typed
* Readable
* Maintainable
* Reusable
* Consistent
* Secure

Code quality is more important than implementation speed.

## Available Skills

Skills are located in:

.agents/skills/

Available skills:

- .agents/skills/frontend-design/SKILL.md
- .agents/skills/nodejs-backend-patterns/SKILL.md
- .agents/skills/typescript-advanced-types/SKILL.md

# Skill Loading Rules

When implementing frontend features:

Load:
- .agents/skills/frontend-design/SKILL.md
- .agents/skills/typescript-advanced-types/SKILL.md

---

When implementing backend features:

Load:
- .agents/skills/nodejs-backend-patterns/SKILL.md
- .agents/skills/typescript-advanced-types/SKILL.md

---

When implementing fullstack features:

Load:
- .agents/skills/frontend-design/SKILL.md
- .agents/skills/nodejs-backend-patterns/SKILL.md
- .agents/skills/typescript-advanced-types/SKILL.md

---

When modifying .ts or .tsx files:

Always load:
- .agents/skills/typescript-advanced-types/SKILL.md

# Post Implementation Checklist

After implementation verify:

- TypeScript compiles
- No unused imports
- No unused variables
- No new any types introduced
- Routes still work
- API contracts remain unchanged
- Existing business rules remain valid
- No duplicated code introduced
- No console.log left behind

Provide:

1. Modified files
2. Affected endpoints
3. Affected database tables
4. Security considerations
5. Manual testing checklist