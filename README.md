NOTE: 

NX placed the apps and libs at the workspace root (api, dashboard, data, auth). This matches the intended architecture from the challenge — the folder names map directly to the apps/libs described in the PDF.


---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------


Setup Instructions
1. Clone the Repository
 
git clone https://github.com/sagar3181/turbovets-task-manager.git
cd turbovets-task-manager

2. Backend (API – NestJS)
 
cd api
npm install

Environment Variables (api/.env)
 
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=postgres
DB_NAME=turbovets
JWT_SECRET=supersecret
JWT_EXPIRES=1h

Run the Backend
 
npx nx serve api

API will be available at:
👉 http://localhost:3000/api


3. Frontend (Dashboard – Angular)
 
cd dashboard
npm install

Run the Frontend
 
npx nx serve dashboard

UI will be available at:
👉 http://localhost:4200


🏗️ Architecture Overview
This is an Nx monorepo containing both backend and frontend apps:

 
turbovets-task-manager/
│
├── api/ # NestJS backend
│ ├── src/
│ │ ├── app/ # AppModule & controllers
│ │ ├── auth/ # Auth (JWT, Guards, RBAC)
│ │ ├── users/ # User module
│ │ ├── tasks/ # Task module (CRUD)
│ │ └── entities/ # TypeORM entities: User, Task, Organization
│
├── dashboard/ # Angular frontend
│ ├── src/app/
│ │ ├── auth/ # Login form
│ │ ├── dashboard/# Task dashboard
│ │ └── shared/ # Shared UI/services
│
└── libs/ # Shared data types (DTOs)

Backend: NestJS + TypeORM + PostgreSQL + JWT Auth
Frontend: Angular + Tailwind/SCSS + CDK Drag/Drop
Monorepo Tooling: Nx (build, serve, lint, test)
🔐 Access Control Design (RBAC)
Roles
Owner → Full access across organizations
Admin → Manage tasks within their organization
Viewer → Read-only, can only view their own tasks
Guards & Decorators
JwtAuthGuard → Ensures every request is authenticated
RolesGuard → Restricts actions based on user role
@Roles() decorator → Marks endpoints with required roles
Data Models
User

 
id, email, password, role ('owner' | 'admin' | 'viewer'), organizationId

Task

 
id, title, description, status, category, createdBy, organization

Organization

 
id, name, users[], tasks[]


📡 Sample API Requests
Login
 
curl -X POST http://localhost:3000/api/auth/login \
-H "Content-Type: application/json" \
-d '{"email":"admin@tv.com","password":"admin123"}'

✅ Response:

 
{
"access_token": "JWT_TOKEN_HERE"
}


Create Task
 
curl -X POST http://localhost:3000/api/tasks \
-H "Authorization: Bearer JWT_TOKEN_HERE" \
-H "Content-Type: application/json" \
-d '{"title":"New Task","description":"Test RBAC","category":"Work"}'


Get Tasks
 
curl -H "Authorization: Bearer JWT_TOKEN_HERE" \
http://localhost:3000/api/tasks


Update Task
 
curl -X PUT http://localhost:3000/api/tasks/1 \
-H "Authorization: Bearer JWT_TOKEN_HERE" \
-H "Content-Type: application/json" \
-d '{"status":"done"}'


Delete Task
 
curl -X DELETE http://localhost:3000/api/tasks/1 \
-H "Authorization: Bearer JWT_TOKEN_HERE"


🌟 Frontend Features
Login → stores JWT token in localStorage
Dashboard with Task CRUD
Drag-and-drop reordering/status updates
Filter & categorize (Work, Personal, etc.)
Dark/Light mode toggle
Responsive UI (desktop ↔ mobile)
Task completion visualization (bar chart)
Keyboard shortcuts for common actions

🚀 Future Enhancements
✅ Security:

Refresh tokens & session management
Password reset flow
✅ Scalability:

Migrate to microservices or modular GraphQL API
Caching (Redis) for performance
✅ Testing:

E2E tests with Cypress
More Jest unit tests
✅ Infra:

CI/CD pipelines
Deployment to Render (API) + Vercel (UI)
✅ UI Improvements:

Calendar integration
Task templates
Real-time updates (WebSockets)

📽️ Walkthrough Video
👉 Zoom Cloud Recording : https://slu.zoom.us/rec/share/eeKr-_8N60KeGAvM6ROLeCR7w0WUfbcIFp1H_3rgaw3uGscDq6jSxwYJGuOMpj0d.3aGHExxhguYOf4NR?startTime=1759015000000