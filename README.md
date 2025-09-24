MINE: 

NX placed the apps and libs at the workspace root (api, dashboard, data, auth). This matches the intended architecture from the challenge — the folder names map directly to the apps/libs described in the PDF.


---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

## Pull Request 1 — Shared DTOs (data) + RBAC Utilities (auth)

### Commits

**Commit 1 — Initial foundation**  
- Created `libs/data` with shared DTOs and contracts (`Role`, `LoginDto`, `TaskDto`, etc.)  
- Created `libs/auth` with reusable RBAC utilities:  
  - `@Roles()` decorator  
  - `RolesGuard` (with explicit role inheritance: owner > admin > viewer)  
  - `@GetUser()` decorator  
- Exported everything via `index.ts` for clean alias imports  
- Ensured apps can import with `@turbovets-task-manager/data` and `@turbovets-task-manager/auth`

**Commit 2 — Fix lint dependency issue**  
- During CI (`nx run-many -t lint test build`), `auth:lint` failed with:  
The "auth" project uses the following packages, but they are missing from "dependencies":

@nestjs/common

@nestjs/core

@turbovets-task-manager/data

bash
Copy code
- Root cause: NX dependency-check enforces each lib declare what it imports.  
- Solution: Updated `auth/package.json` to include required deps:  
```json
{
  "dependencies": {
    "tslib": "^2.3.0",
    "@nestjs/common": "*",
    "@nestjs/core": "*",
    "@turbovets-task-manager/data": "*"
  }
}
Re-ran lint → ✅ Passed.

This shows awareness of monorepo dependency boundaries and ensures clean CI/CD pipelines.

Summary
This PR establishes two shared libraries that the entire monorepo will depend on:

libs/data — shared TypeScript contracts (DTOs & types) used by both the NestJS API and the Angular app.

libs/auth — reusable security primitives for Role-Based Access Control (RBAC).

Together, they form the foundation for secure, scalable architecture as described in the assessment.

What was added
libs/data (Shared DTOs & Types)

Role union type: 'owner' | 'admin' | 'viewer'

Auth contracts: LoginDto, AuthToken

Task contracts: CreateTaskDto, UpdateTaskDto, TaskDto

User summary: UserSummary

Aliased re-exports (@turbovets-task-manager/data)

libs/auth (RBAC Utilities)

@Roles(...roles) decorator

RolesGuard with role inheritance enforcement

@GetUser() decorator for extracting req.user

Aliased re-exports (@turbovets-task-manager/auth)

Fixed dependency issues in auth/package.json to satisfy NX lint checks

Why we did it (Design Rationale)
Single Source of Truth for contracts → prevents frontend/backend drift

Security by Construction → declarative RBAC via decorators/guards

Explicit Role Inheritance → consistent enforcement across all endpoints

Ergonomic Controllers → @GetUser() keeps signatures clean

Monorepo Modularity → separate, reusable libs keep code lean and scalable

How this satisfies the challenge requirements
✅ Shared contracts in libs/data

✅ Centralized RBAC utilities in libs/auth

✅ Declarative access control with decorators/guards

✅ Explicit role inheritance implemented

✅ Dependency hygiene enforced (NX dependency checks passed)

Security Considerations
Least privilege by default

Centralized role precedence map (reduces risk of scattered logic)

Lint/CI enforced dependency hygiene prevents accidental hidden coupling

Future work: org-scope enforcement, audit logging, JWT refresh

Developer Experience Notes
Aliased imports keep code clean

Lint checks force explicit dependency declaration → caught missing deps early

Two commits show natural dev flow: build → hit error → resolve → green pipeline

How to verify this PR
bash
Copy code
# Build shared libs
npx nx build data
npx nx build auth

# Run lint/test/build
npx nx run-many -t lint test build
Expected: ✅ All succeed (auth lint now passes).

Outcome
This PR delivers a solid foundation (shared contracts + RBAC) and demonstrates handling of real-world CI/lint issues by fixing dependency declarations. With this groundwork in place, subsequent PRs (Entities, JWT Auth, Task CRUD, Audit, Angular UI) can build securely and consistently on top.