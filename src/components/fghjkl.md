# Project Instructions (Django + DRF + React Monolith)

> [!NOTE]
> For high-level architecture overview, see [ARCHITECTURE.md](file:///Users/shivam/Documents/github/project-starter-full-stack/ARCHITECTURE.md).

## Role
You are an expert Django + DRF engineer. Optimize for correctness, maintainability, and performance. Follow existing project conventions. Don’t invent new architecture.

## Critical Architecture Rules (The Law)
1. **NO MIGRATIONS**: This project **never** uses database migrations. The database is ephemeral.
   - Do not generate `0001_initial.py` or any migration files.
   - Do not use `makemigrations`.
   - The database is always recreated from scratch using `reset_db.sh` which uses `migrate --run-syncdb`.
   - Models are the single source of truth.

## Stack & Defaults
- **Backend**: Django + Django REST Framework (DRF)
- **Auth**: JWT (SimpleJWT) via `Authorization: Bearer <token>`
- **Code Quality**: `black`, `isort`, `flake8`, and **`pylint`** (strict 10/10 goal).
- **Quality Gate**: Mandatory **pre-push** hooks (checks run only when pushing code).
- **Docs**: `drf-spectacular` (Swagger/Redoc).
- **DB**: PostgreSQL (assume Postgres features available)
- **Frontend**: Vite + React
- **Environment**:
  - Python: **3.11.x** (Mandatory)
  - Node.js: **v24 (LTS)** (Mandatory via `.nvmrc`)
  - Django: **5.2.11 (LTS)** (pinned in `requirements.txt`)
  - Backend runs on: **http://localhost:8000**
  - Frontend dev server: **http://localhost:5173**
  - **Virtual Env**: strict usage of `.venv` (managed via `direnv` or manual activate).
- **CORS**: allow only `http://localhost:5173` in development

## 🔍 Debugging & Profiling (Dev Mode Only)
- **Backend (Django Silk)**: [http://localhost:8000/silk/](http://localhost:8000/silk/). Use to inspect SQL queries and request timing.
- **Frontend (React Query Devtools)**: Floating icon in bottom-right. Use to inspect cache and fetch status.
- **Frontend (React Scan)**: Visual indicators for re-renders. Use to find unnecessary component updates.

### Debugging Procedures
1. **N+1 Queries**: Visit `/silk/` to find duplicate queries. Fix using `select_related` or `prefetch_related`.
2. **Data Invalidation**: Use **React Query Devtools** to verify cache invalidation after mutations.
3. **Ghost Re-renders**: Use **React Scan** to identify and fix unnecessary component updates using `React.memo` or `useMemo`.

## Code Style & Formatting (Strict)
- **Imports MUST be at the top** of the file. No inline imports.
- use `isort` profile `black` for organization.
- use `black` for formatting.
- Group imports: Standard Lib > Third Party > Local Application.

## Project Layout (Do not change)

```
/my-monolith-app
├── backend/
│   ├── .venv/             # Python Virtual Environment (Mandatory)
│   ├── manage.py
│   ├── config/            # Project settings & WSGI/ASGI
│   │   ├── settings/
│   │   │   ├── base.py    # Core settings
│   │   │   ├── development.py
│   │   │   └── production.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── core/              # Shared utilities
│   │   ├── responses.py   # Unified response structures
│   │   ├── exceptions.py  # Global exception handler
│   │   ├── pagination.py  # Custom pagination
│   │   └── permissions.py # Base permissions
│   └── api/
│       └── v1/
│           ├── auth/      # Auth logic (SignUp, Me)
│           ├── <domain>/
│           │   ├── urls.py
│           │   ├── serializers.py
│           │   ├── views.py
│           │   └── permissions.py
│           └── urls.py
└── frontend/
```

### Scaling Rule
- **`config/`**: Project settings hub.
- **`core/`**: Shared utilities (responses, exceptions) generic across apps.
- **`api/`**: Transport only (serializers/views/urls).
- **`apps/`**: Domain Logic (Models, Admin).
  - **Rule**: Every new model MUST be registered in `admin.py` immediately.

## API Contract (Mandatory)
All endpoints MUST return a unified envelope.

### Success
```json
{
  "success": true,
  "message": "Human readable summary",
  "data": {},
  "meta": {}
}
```
* `meta` is required for paginated lists (count/next/previous/page_size).

### Error
```json
{
  "success": false,
  "message": "Error description",
  "errors": { "field": ["detail"] },
  "error_code": "SOME_STABLE_CODE"
}
```
* Use `core.responses` helpers ONLY (no ad-hoc Response shapes).

## Design Rules (Non-negotiable)

### Views
* Prefer **DRF ViewSets + routers**.
* Views handle request/response only. No heavy business logic in views.

### Serializers
* Validation + serialization only.
* For complex create/update: call a service function (don’t embed orchestration).

### Business Logic Placement
* **Services (preferred)**: `<domain_app>/services.py` for orchestration and multi-step logic.
* **Models/Managers**: invariants + query composition.
* **Transactions**: Use `transaction.atomic()` in service layer for multi-write operations.

### ORM & Performance
* **ORM first**. No raw SQL unless explicitly requested.
* **Prevent N+1**: Always use `select_related` / `prefetch_related`.
* Add indexes for frequently filtered/sorted fields.

### Security
* Authentication is **mandatory** for all API access except specific routes (signin/signup).
* Default permission is `IsAuthenticated`.
* Public endpoints must be explicitly documented and configured in `config/urls.py`.
* **Prevent IDOR**: always scope querysets by current user/tenant/ownership.

## Error Handling
* Use a global exception handler in `core.exceptions`.
* Use stable `error_code`s (uppercase snake case).
* No leaking stack traces in responses.

## Logging
* Structured logging (JSON-style) preferred.
* Log request_id, user_id, path, method, status_code, and latency.

## Testing Definition of Done
For every endpoint:
* tests for: success, validation error, unauthorized (401), forbidden (403 if applicable).
* if list endpoint: pagination tested.
* if permissions apply: ownership scoping tested (IDOR prevention).

## Common Patterns to Follow

### Creating a New API Endpoint
1. Define/Update Model in `apps/<domain>/models.py`.
2. Register in `admin.py`.
3. Write/Update Service in `apps/<domain>/services.py`.
4. Create Serializer in `api/v1/<domain>/serializers.py`.
5. Create ViewSet in `api/v1/<domain>/views.py`.
6. Add Route in `api/v1/<domain>/urls.py`.
7. Write Tests for success/error/permissions.

## Output Rules for the Assistant
When implementing changes:
1. State the files you will create/modify.
2. Provide code grouped by file path.
3. Keep diffs minimal—do not refactor unrelated code.
4. Do not introduce new dependencies unless necessary.
5. If anything is ambiguous, choose the most Django-idiomatic option and proceed.

---

# Frontend Starter Pack (React + TypeScript + Vite + Tailwind + shadcn/ui)

## Stack (Do not deviate)
- React + TypeScript + Vite
- TailwindCSS for styling (no CSS files, no styled-components)
- shadcn/ui + Radix primitives (base UI in `src/components/ui`)
- Icons: lucide-react (if present; otherwise don’t introduce a new icon library)
- Server state: React Query (if present; otherwise use fetch + local state and do NOT add deps without request)
- API calls use `/api/...` only (Vite proxy routes to backend at :8000)
- Frontend runs on **http://localhost:5173**

---

## Architecture (must follow)
- `src/api/` = client + shared API utilities (auth headers, interceptors, error normalize)
- `src/components/` = reusable UI (layout, shared, ui)
- `src/features/<feature>/` = feature-specific UI + hooks + api + types
- `src/hooks/` = shared hooks
- `src/lib/` = utilities (e.g. `utils.ts` for `cn`)
- `src/types/` = global TS types

### Scaling rule
- Feature logic stays inside `features/<feature>`; avoid dumping everything into `components/`.

---

## DESIGN SYSTEM DEFAULTS (Enforce consistency)
### Layout & Spacing
- Use a consistent spacing scale (Tailwind): `2, 4, 6, 8, 10, 12, 16`.
- Page layout:
  - Outer padding: `px-4 sm:px-6 lg:px-8`
  - Content max width: `max-w-6xl` (or `max-w-7xl` for dashboards)
  - Vertical rhythm: `space-y-6` / `space-y-8` for sections
- Grid defaults:
  - Cards: `grid gap-4 sm:grid-cols-2 lg:grid-cols-3`
  - Forms: `grid gap-4` with labels aligned, errors inline

### Typography (Hierarchy matters)
- Headings:
  - Page title: `text-2xl sm:text-3xl font-semibold tracking-tight`
  - Section title: `text-lg font-semibold`
  - Helper text: `text-sm text-muted-foreground`
- Avoid long dense paragraphs. Prefer short labels + supporting text.

### Components (shadcn-first)
- Use shadcn UI components before building custom ones:
  - Buttons, Inputs, Select, DropdownMenu, Dialog, Sheet, Tabs, Toast, Tooltip
- Prefer `Card` as the default container for grouped content.
- Use consistent radius/shadow patterns from shadcn defaults (don’t invent new ones).

### Visual Quality Rules
- Every interactive element must have:
  - Hover state
  - Focus-visible state
  - Disabled state (if applicable)
- Avoid “flat” UI: use spacing, grouping, and hierarchy instead of heavy borders.

---

## UX PATTERNS (No amateur flows)
### States (Mandatory for screens)
Every data-driven view must implement:
- Loading state (skeleton or spinner)
- Empty state (explain + clear CTA)
- Error state (human message + retry)
- Success feedback (toast or inline confirmation)

### Forms (Mandatory)
- Labels are required (don’t rely on placeholder as label).
- Inline validation errors under fields.
- Disable submit while submitting.
- Provide success confirmation and redirect only when appropriate.
- Destructive actions require confirmation dialog.

### Tables & Lists
- Support: empty state, loading skeleton rows, pagination (or infinite scroll).
- Row actions go into a dropdown menu if more than 2 actions.
- Never show raw IDs to users unless it’s a system/admin tool.

### Navigation & Information Scent
- Breadcrumbs for deep pages (if routing exists).
- Titles must match user intent (“Orders”, “Inventory”, “Settings”), not internal names.

---

## Accessibility (Correct defaults)
- Use semantic HTML first:
  - `<button>` for actions
  - `<a href>` for navigation
  - `<label>` associated to inputs
- Do NOT make `<div>` clickable. If unavoidable:
  - `role="button"`, `tabIndex={0}`, Enter/Space key handling, and aria label.
- Icon-only buttons must have `aria-label`.
- Ensure focus management in Dialog/Sheet (Radix handles this if used properly).
- Respect reduced motion (avoid aggressive animation).

---

## TypeScript & Coding Rules (Non-negotiable)
- Strict TS; avoid `any`. Define interfaces for props and API payloads.
- Prefer `const fn = () => {}`.
- Early returns for readability.
- Extract repeated UI. Split files > 200 lines.
- No hardcoded backend URLs; only `/api/...`.
- Conditional classes must use `cn()` (never invalid directives like `class:`).

---

## API Contract
Assume backend returns:
- Success: `{ success: true, message: string, data: T, meta?: object }`
- Error: `{ success: false, message: string, errors?: Record<string,string[]>, error_code?: string }`

### Rules
- Define shared types in `src/types/api.ts`.
- Centralize error normalization in `src/api/client.ts`.
- UI should display user-friendly messages (not raw server dumps).

---

## Output Rules (How the assistant should deliver code)
When implementing changes:
1) List files to add/modify.
2) Provide complete code grouped by file path.
3) Minimal diffs; no unrelated refactors.
4) If ambiguity exists, state assumptions and proceed (don’t stall).
