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


PR 2 — Entities, Seeding, and Tasks API

This README explains Steps 3, 4, and 5 of the challenge.
We built the core backend foundation: database entities, user seeding, and a secure tasks API.

Step 3: Entities (The Building Blocks)

Think of entities like shapes in a Lego box.
You need the shapes first before you can build a castle.
In our app, the shapes are:

User → A person using the system.

Organization → A group (like "TurboVets HQ" or a "Clinic").

Task → A job to be done (like “Check patient” or “Clean cage”).

What we did

Created User, Organization, and Task classes inside api/src/entities.

Used TypeORM decorators (@Entity, @Column, @ManyToOne, etc.) so PostgreSQL knows how to store them.

Set up relationships:

A User belongs to one Organization.

A Task belongs to an Organization and has a creator (User).

An Organization can have a parent (HQ → Clinic A).

Problem we hit

At first, TypeORM complained about missing parent or wrong imports.

We fixed imports to always use relative paths (./task.entity instead of ../entities/task.entity) and ensured Organization had a parent relation defined.

Step 4: Users + Seeding (Filling the Box with Lego Men)

If entities are the Lego shapes, we now need to add people inside the box.
Otherwise, the app has no users and no one can log in.

What we did

Added a UsersService with a seed() method.

On app startup, it checks: “Do I already have users?”

If yes → Do nothing.

If no → Create default data.

We created:

Organization TurboVets HQ.

Organization Clinic A with parent HQ.

3 users:

Owner (owner@tv.com / owner123)

Admin (admin@tv.com / admin123)

Viewer (viewer@tv.com / viewer123)

Passwords are hashed with bcrypt before saving.

Problem we hit

Got errors like UpdateValuesMissingError because TypeORM didn’t like how we created/saved orgs.

Solved by saving hq first, then creating clinic with parent: hq, then saving it separately.

This way, parent → child relation is properly respected.

Step 5: Tasks API (Letting Lego Men Do Work)

Now the users (Lego men) needed something to do → Tasks.

What we did

Created a TasksModule, TasksService, and TasksController.

Endpoints:

POST /tasks → create a task

GET /tasks → list tasks

PATCH /tasks/:id → update a task

DELETE /tasks/:id → delete a task

Protected them with JWT + RBAC:

Owner → can do everything.

Admin → can manage tasks in their org.

Viewer → can only update their own tasks.

Problem we hit

First, NestJS couldn’t connect to PostgreSQL (role "postgres" does not exist).

Solution:

Installed PostgreSQL via brew.

Created the role:

CREATE ROLE postgres WITH LOGIN SUPERUSER PASSWORD 'postgres';


Created the database:

CREATE DATABASE turbovets OWNER postgres;


After this, NestJS booted and auto-ran the seed() successfully.

Verified logs:

[seed] Users ready: owner@tv.com/owner123, admin@tv.com/admin123, viewer@tv.com/viewer123

Testing the Flow

Login with a seeded user:

curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@tv.com","password":"admin123"}'


→ Gets you an access_token.

Create a Task (admin/owner only):

curl -X POST http://localhost:3000/api/tasks \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"title":"First Task","description":"RBAC works","category":"Work"}'


List Tasks:

curl -H "Authorization: Bearer <TOKEN>" http://localhost:3000/api/tasks


Update Task (viewer can only update their own):

curl -X PATCH http://localhost:3000/api/tasks/1 \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"status":"in_progress"}'


Delete Task (admin/owner allowed):

curl -X DELETE http://localhost:3000/api/tasks/1 \
  -H "Authorization: Bearer <TOKEN>"

Why This Matters (Tying Back to the PDF)

Entities give us a clean database model.

Seeding ensures the app is immediately testable (no manual inserts).

Tasks API proves RBAC rules are real and enforced, not just theory.

Every piece matches the PDF’s requirement: secure, scalable, multi-tenant RBAC app.

✅ With Steps 3, 4, and 5 complete:

Backend can boot, seed, authenticate, and manage tasks.

Next steps will be audit logging + Angular frontend.

PR #3 — Org Scoping (Step 6) + Audit Logs (Step 7)
🎯 Summary

This PR finalizes the backend security model by:

Enforcing organization-level scoping on tasks so users can only act within their permissions.

Adding audit logging for every task create, update, and delete action.

Together, these changes deliver the secure, scalable RBAC enforcement that the challenge PDF emphasizes.

🛠 What was added
1) Org Scoping in TasksService

Owner: Can see all tasks across all organizations.

Admin: Restricted to tasks within their own organization.

Viewer: Can only see and update tasks they personally created.

Example from list():

if (user.role === 'owner') return this.tasks.find();
if (user.role === 'admin') return this.tasks.find({ where: { organization: { id: user.organizationId } } });
return this.tasks.find({ where: { createdBy: { id: user.id } } });

2) Audit Logging

Added a simple audit() helper inside TasksService.

Logs every CREATE, UPDATE, and DELETE action with:

user id

role

organization id

task id

Example log:

[audit] CREATE by user=2 (role=admin, org=4) on task=7

⚠️ Problems We Faced & Fixes

Unauthorized 401s during testing

Cause: forgot to replace <TOKEN> with the real JWT in curl requests.

Fix: used the full access_token from /auth/login in the Authorization: Bearer ... header.

email not on UserCtx type

Cause: tried to log user.email in audit, but UserCtx didn’t have it.

Fix: removed email logging (only log id, role, org). Future improvement: extend UserCtx if email needed.

UpdateQueryBuilder error (“update values missing”)

Cause: seeding was trying to save parent/child orgs in one go.

Fix: saved HQ org first, then saved Clinic org with parent: hq.

✅ Why This Matters

Security by design: Every action (list/create/update/delete) is scoped to role + org.

Accountability: Audit logs provide a clear trail of who did what, and when.

Scalability: Role precedence and org checks are centralized in one service → future changes are easy.

Challenge alignment: This directly satisfies the PDF’s focus on RBAC + auditability.

🔍 How to Test
# Login as admin
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@tv.com","password":"admin123"}'

# Use the returned access_token
TOKEN=<paste_token_here>

# Create a task (admin/owner allowed)
curl -X POST http://localhost:3000/api/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"First Task","description":"RBAC works","category":"Work"}'

# Viewer tries to create (should fail)


You’ll see [audit] ... logs in the API console when actions succeed.

🚀 Outcome

With this PR:

Backend RBAC is complete — org-aware, role-aware, and audit-logged.

The system is now secure enough to expose endpoints to the Angular frontend.

Next step: build the Dashboard UI to interact with these APIs.