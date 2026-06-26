# AGENTS.md — BarberShop MVP

# Purpose

This file defines how AI agents must work inside this repository.

The purpose of this file is NOT to document the business.

The purpose of this file is to define:

* How the AI should work.
* What documentation must be consulted.
* What architecture must be respected.
* What workflow must be followed.

---

# Source Of Truth

The primary source of truth is:

```txt
docs/MVP_UNIPERSONAL_SDD.md
```

Secondary sources:

```txt
docs/BUSINESS_RULES.md
docs/DATABASE_RULE.md
docs/API_SPEC.md
docs/SECURITY.md
docs/USE_CASES.md
docs/UI_GUIDELINES.md
docs/ROADMAP.md
docs/MODULE_REFACTOR.md
```

If conflicts exist:

```txt
MVP_UNIPERSONAL_SDD.md wins.
```

---

# Mandatory Workflow

Before writing code:

1. Read AGENTS.md.
2. Read relevant documentation.
3. Identify affected modules.
4. Identify affected database tables.
5. Identify affected endpoints.
6. Identify affected business rules.
7. Present implementation plan.

---

# Planning Rules

For:

* New features
* Refactors
* Architecture changes
* Fullstack changes

The agent must:

1. Analyze requirements.
2. Present a plan.
3. List affected files.
4. Explain risks.
5. Wait for approval.

Do not immediately generate code.

For small fixes:

* Analysis can be shorter.
* Planning can be summarized.

---

# Current Backend Architecture

The backend uses a modular architecture.

Current structure:

```txt
backend/src/
├── config/
├── middlewares/
├── modules/
│   ├── auth/
│   ├── profiles/
│   ├── services/
│   ├── customers/
│   ├── appointments/
│   ├── dashboard/
│   └── barbers/
├── routes/
├── shared/
├── app.ts
└── server.ts
```

Rules:

* Respect module boundaries.
* Reuse existing modules.
* Do not create new architectural patterns without approval.
* Follow Controller → Use Case → Repository flow.

---

# Current Frontend Architecture

Current structure:

```txt
frontend/src/
├── assets/
├── components/
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

Before creating new files:

* Search existing components.
* Search existing hooks.
* Search existing services.
* Search existing schemas.
* Search existing stores.
* Search existing types.

Avoid duplicate implementations.

---

# Frontend Development Rules

Use:

* React Functional Components
* TypeScript
* React Hook Form
* Zod
* Axios
* Zustand
* React Router

Avoid:

* Class Components
* Massive Components
* Duplicated State
* Business Logic Inside JSX

Components should have a single responsibility.

Prefer reusable components.

---

# Backend Development Rules

Controllers:

* Receive requests.
* Validate input.
* Call use cases.
* Return responses.

Controllers must remain thin.

Use Cases:

* Contain business logic.
* Coordinate repositories.
* Enforce business rules.

Repositories:

* Access Supabase.
* Execute CRUD operations.
* Must not contain business logic.

---

# TypeScript Rules

Avoid:

```ts
any
```

unless absolutely necessary.

Always type:

* Props
* Services
* Hooks
* Responses
* Contexts
* Stores

Prefer:

* interfaces
* types
* generics

Keep TypeScript strict.

---

# State Management Rules

Use Zustand only for real global state.

Current global state:

```txt
authStore
```

Avoid moving local UI state into Zustand.

Keep stores focused.

---

# API Rules

Use centralized API services.

Do not:

* Create axios instances inside components.
* Call APIs directly inside JSX.

Handle:

* Loading
* Error
* Success

consistently.

---

# Security Rules

Always follow:

```txt
docs/SECURITY.md
```

Security takes precedence over implementation speed.

Never:

* Expose secrets.
* Expose tokens.
* Expose service role keys.

Never trust frontend input.

---

# UI Rules

Always follow:

```txt
docs/UI_GUIDELINES.md
```

Requirements:

* Responsive design.
* Mobile support.
* Loading states.
* Reusable components.
* Clear validation messages.

---

# Skills

Available skills:

```txt
.agents/skills/frontend-design/SKILL.md
.agents/skills/nodejs-backend-patterns/SKILL.md
.agents/skills/typescript-advanced-types/SKILL.md
```

---

# Skill Loading Rules

Frontend tasks:

```txt
.agents/skills/frontend-design/SKILL.md
.agents/skills/typescript-advanced-types/SKILL.md
```

Backend tasks:

```txt
.agents/skills/nodejs-backend-patterns/SKILL.md
.agents/skills/typescript-advanced-types/SKILL.md
```

Fullstack tasks:

```txt
.agents/skills/frontend-design/SKILL.md
.agents/skills/nodejs-backend-patterns/SKILL.md
.agents/skills/typescript-advanced-types/SKILL.md
```

---

# Post Implementation Checklist

After implementation verify:

* TypeScript compiles.
* Imports are valid.
* No unused imports.
* No duplicated code.
* No unnecessary any types.
* Existing architecture remains intact.
* Existing business rules remain valid.
* Existing endpoints remain compatible.

Provide:

1. Modified files.
2. Affected endpoints.
3. Affected tables.
4. Security considerations.
5. Manual testing steps.

---

# Final Rule

When in doubt:

1. Consult documentation.
2. Preserve architecture.
3. Prefer simple solutions.
4. Avoid unnecessary complexity.
5. Ask for clarification before making assumptions.