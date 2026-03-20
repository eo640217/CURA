# CURA

CURA is a full-stack care operations application for managing facilities, units, residents, and staff workflows.

The repository contains:
- a Spring Boot API for authentication, resident and facility operations, and role-based access control
- a React and Vite web app for day-to-day staff and admin workflows
- a PostgreSQL database configured for local development with Docker Compose

## What CURA does

Based on the current codebase, CURA supports these core workflows:

- JWT-based login for authenticated users
- role-based access with `ADMIN` and `STAFF`
- facility creation, listing, editing, and deletion
- unit creation and maintenance within facilities
- resident directory and resident detail views
- creating residents under units
- transferring residents between units with capacity-aware UI logic
- resident notes
- admin user creation and user listing
- dashboard, activity, and hours-oriented views

The domain model is centered around:

`Facility -> Unit -> Resident`

## Repository structure

```text
.
|-- cura-api/     Spring Boot backend
|-- cura-web/     React + Vite frontend
|-- docker-compose.yml
`-- README.md
```

## Tech stack

### Backend

- Java 17
- Spring Boot 4
- Spring Web MVC
- Spring Data JPA
- Spring Security
- Flyway
- PostgreSQL
- JWT via `jjwt`
- OpenAPI UI via `springdoc-openapi`

### Frontend

- React 19
- Vite
- React Router
- Axios
- Material UI
- Sass

## Local development architecture

- PostgreSQL runs in Docker on host port `5433`
- the API runs on `http://localhost:8080`
- the web app talks to the API at `http://localhost:8080/api/v1`
- the frontend dev server is expected to run on `http://localhost:5173`

## Prerequisites

Install the following before running the project locally:

- Java 17
- Node.js 20+ and npm
- Docker Desktop or Docker Engine with Compose support

Optional but useful:

- Maven if you do not want to use the included wrapper
- a REST client or browser for testing API endpoints

## Getting started

### 1. Start PostgreSQL

From the repository root:

```powershell
docker compose up -d
```

The Compose file creates a local PostgreSQL container named `cura-postgres` and exposes it on port `5433`.

Important:

- `docker-compose.yml` expects a root-level `.env` value named `DB_PASSWORD`
- the backend is currently configured to connect to PostgreSQL using password `3003` in `cura-api/src/main/resources/application.yml`

For the current local setup to work as written, make sure your Docker Compose database password matches the backend datasource password.

Example root `.env` entry for local development:

```env
DB_PASSWORD=3003
```

### 2. Start the backend

From `cura-api`:

```powershell
cd cura-api
.\mvnw.cmd spring-boot:run
```

Alternative on Unix-like shells:

```bash
cd cura-api
./mvnw spring-boot:run
```

What the backend currently does on startup:

- listens on port `8080`
- runs Flyway migrations from `src/main/resources/db/migration`
- validates the schema using JPA
- enables CORS for `http://localhost:5173` and `http://localhost:3000`
- seeds default local users if they do not already exist

### 3. Start the frontend

From `cura-web`:

```powershell
cd cura-web
npm install
npm run dev
```

The app uses a hardcoded Axios base URL of `http://localhost:8080/api/v1` in the current codebase.

## Default local users

The backend seeds two local development users on startup:

- `admin` / `password`
- `staff` / `password`

Roles:

- `ADMIN` can register users and perform admin-only operations such as facility and unit mutations
- `STAFF` can access authenticated workflows such as resident reads and resident management flows exposed to non-admin users

These credentials are suitable only for local development.

## Main application areas

### Web routes

The frontend currently exposes these primary routes:

- `/login`
- `/`
- `/facilities`
- `/residents`
- `/units`
- `/hours`
- `/admin`
- `/admin/users`

### Backend API areas

The API is organized around these main modules:

- `/api/v1/auth`
- `/api/v1/users`
- `/api/v1/facilities`
- `/api/v1/units`
- `/api/v1/residents`
- `/api/v1/activity`

Because the project includes `springdoc-openapi-starter-webmvc-ui`, API documentation should be available when the backend is running through the standard Springdoc Swagger UI endpoint.

## Typical workflow

1. Start PostgreSQL with Docker Compose.
2. Start the Spring Boot API.
3. Start the Vite frontend.
4. Sign in as `admin` or `staff`.
5. Create or manage facilities.
6. Create units within facilities.
7. Add residents to units.
8. Transfer residents between units as capacity changes.
9. Use the admin area to manage user accounts.

## Known gaps and caveats

This README is based on the current repository state. A few things are still rough or incomplete:

- the root README was previously empty, so this documentation was inferred from code and config
- `cura-api/HELP.md` and `cura-web/README.md` still contain mostly generated template content
- the frontend sidebar includes links such as audit logs that do not currently have matching routes in the main app router
- the shell includes navigation to settings, but a corresponding route is not present in the main route map
- some resident and unit endpoint responsibilities appear partially duplicated, which suggests the backend API surface is still being refined
- secrets and passwords are not fully externalized yet; some values are still hardcoded in application config

## Security note

The current repository is configured for local development convenience, not production readiness.

Before any deployment or shared-environment use, you should at minimum:

- move database credentials out of committed config
- move JWT secrets out of committed config
- replace seeded default passwords
- review all endpoint authorization rules
- add environment-specific configuration management

## Where to start in the codebase

If you are new to the repo, these are the best entry points:

- backend app configuration: `cura-api/src/main/resources/application.yml`
- backend security: `cura-api/src/main/java/com/cura/common/SecurityConfig.java`
- resident workflows: `cura-api/src/main/java/com/cura/resident/ResidentController.java`
- frontend routes: `cura-web/src/App.tsx`
- frontend shell: `cura-web/src/layout/AppShell.tsx`
- facility UI: `cura-web/src/views/FacilitiesView.tsx`
- resident UI: `cura-web/src/components/ResidentsPanel.tsx`
- admin user UI: `cura-web/src/views/AdminUsersView.tsx`

## Contributing

If you extend the project, a sensible order is:

1. clean up configuration and secret handling
2. align documented environment variables with actual runtime usage
3. remove or implement placeholder routes such as audit logs and settings
4. add tests around resident transfer, facility management, and user administration
5. expand project documentation with screenshots, sample data, and deployment guidance
