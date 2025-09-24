MINE: 

NX placed the apps and libs at the workspace root (api, dashboard, data, auth). This matches the intended architecture from the challenge — the folder names map directly to the apps/libs described in the PDF.


---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

Pull Request 1 — Shared DTOs (data) + RBAC Utilities (auth)

Summary

This PR establishes two shared libraries that the entire monorepo will depend on:

libs/data — shared TypeScript contracts (DTOs & types) used by both the NestJS API and the Angular app.

libs/auth — reusable security primitives for Role-Based Access Control (RBAC): an endpoint-level @Roles() decorator, a RolesGuard that enforces role inheritance, and a @GetUser() decorator for accessing the authenticated principal in controllers.

This is the foundation for the secure, scalable architecture the assessment asks for.

What was added
1) libs/data (Shared DTOs & Types)

Role union type: 'owner' | 'admin' | 'viewer'

Auth contracts: LoginDto, AuthToken

Task contracts: CreateTaskDto, UpdateTaskDto, TaskDto

User summary: UserSummary

Re-exports from data/src/index.ts so both apps import via the alias:

import { CreateTaskDto, Role } from '@turbovets-task-manager/data';

2) libs/auth (RBAC Utilities)

@Roles(...roles) decorator: declare allowed roles at the controller/route level.

RolesGuard: enforces role inheritance (owner > admin > viewer) at runtime, reading the roles required by @Roles.

@GetUser() decorator: retrieves the authenticated req.user (populated by the JWT strategy) to keep controller signatures clean.

Re-exports from auth/src/index.ts for clean imports:

import { Roles, RolesGuard, GetUser } from '@turbovets-task-manager/auth';

Why we did it (Design Rationale)

Single Source of Truth for Contracts

By centralizing DTOs in libs/data, the API and UI compile against the same types.

This prevents subtle drift between the request/response shapes exposed by the backend and the expectations of the frontend.

Security by Construction

RBAC isn’t sprinkled ad-hoc inside controllers; it’s declarative (@Roles) and enforced centrally (RolesGuard).

This separation reduces duplicate logic, improves readability, and makes unit testing straightforward.

Role Inheritance Implemented Explicitly

We encode role precedence (owner > admin > viewer) in one place (the guard), so every protected endpoint benefits automatically.

If we add new roles later, we extend the precedence map in one place.

Ergonomic, Testable Controllers

@GetUser() keeps controller methods focused on business logic while still giving us access to the caller’s role, organizationId, and id.

Monorepo Modularity

Putting DTOs and RBAC in dedicated libs aligns with NX best practices and keeps api & dashboard lean, reducing coupling and making future refactors safer.

How this satisfies the challenge requirements

Monorepo structure (apps + shared libs)
We created dedicated shared libraries for data contracts and RBAC, mirroring the assessment’s architecture expectations.

RBAC implemented with guards/decorators at the API layer
@Roles() + RolesGuard provide declarative access rules and centralized enforcement, exactly what the assessment evaluates.

Scalability & maintainability

Contracts live in one place → fewer bugs and faster iteration.

Adding a new protected endpoint is a one-liner (@Roles('admin')).

Changing role rules is centralized (update the guard’s precedence map).

Testability

DTOs are plain types/ints → trivially testable.

Guards can be unit-tested without full app context using reflector mocks and fake req.user.

Trade-offs & Alternatives Considered

Inline roles in controller logic vs. decorators/guards:
Inline checks are quick but scatter logic and are easy to miss or copy-paste incorrectly. Centralizing with decorators/guards yields better consistency and auditability.

Enum vs. union type for Role:
A TypeScript union keeps generated bundles smaller and remains ergonomic across FE/BE. We can switch to a DB enum later if needed.

Per-resource permissions tables (fine-grained) vs. role inheritance:
Fine-grained ACLs offer maximum flexibility but are heavier for an 8-hour timebox. Starting with role inheritance hits the assessment’s security/scalability goals and leaves room to grow.

Security Considerations

Least privilege by default:
Endpoints without @Roles() still require JWT auth (added next), and any role-restricted endpoints must opt-in explicitly, making required access visible in code review.

Single point of failure hardening:
Because the guard is central, we’ll add unit tests there to prevent accidental regressions (e.g., a refactor that flips precedence).

Future work (planned in later PRs):

Org-scope enforcement in services (owner sees all; admin limited to org; viewer limited to self-authored tasks).

Persisted audit logs (the assessment allows console/file — we start with console and can persist later).

JWT refresh tokens, CSRF protections for cookie-based flows if we migrate away from Authorization headers.

Developer Experience & DX Notes

Aliased imports via tsconfig.base.json keep imports clean (@turbovets-task-manager/data, @turbovets-task-manager/auth), avoiding brittle relative paths.

Thin libs: both data and auth are lightweight, compile quickly, and are easy to mock in tests.

How to verify this PR

Build shared libs

npx nx build data
npx nx build auth


Both should compile.

Example usage in the API (will be added in next PRs)

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'owner')
@Post('/tasks')
createTask(@GetUser() user, @Body() dto: CreateTaskDto) { /* ... */ }

Outcome

This PR lays the security and contracts foundation so that subsequent PRs (Entities, Auth/JWT, Task CRUD with org scoping, Audit endpoint, Angular UI) can be implemented consistently and safely, directly addressing the assessment’s emphasis on secure, scalable RBAC and clean monorepo architecture.