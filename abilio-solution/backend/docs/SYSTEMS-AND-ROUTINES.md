# Systems and Routines — Backend Documentation

This document describes all systems (modules), their routines (endpoints, services, flows), and how they interact.

---

## 1. Application bootstrap

**Entry:** `src/main.ts`

| Routine | Description |
|--------|-------------|
| **bootstrap()** | Creates Nest app, applies global `ValidationPipe` (whitelist, forbidNonWhitelisted, transform), enables CORS, listens on `PORT` (default 3000) at `0.0.0.0`. |

**Global behavior:**
- All request bodies are validated and transformed via `class-validator` / `class-transformer`.
- Extra properties in DTOs are stripped; unknown properties cause 400.

---

## 2. App module and infrastructure

**Module:** `src/app.module.ts`

| Concern | Routine / config | Description |
|---------|-------------------|-------------|
| **Config** | `ConfigModule.forRoot({ isGlobal: true })` | Loads `.env`; env vars available app-wide. |
| **Database** | `TypeOrmModule.forRoot(...)` | PostgreSQL. In **test** (`NODE_ENV=test`): uses `DB_TEST_*` and `synchronize: true`. Otherwise: uses `DB_*` and `synchronize: false`. `autoLoadEntities: true`, connection timeout 10s. |
| **Imports** | UsersModule, LocationsModule, AuthModule, AdminModule | Registers all feature modules. |

**Environment variables:**

| Variable | Purpose | Default (runtime) | Default (test, via setup-e2e) |
|----------|---------|--------------------|-------------------------------|
| DB_HOST | Postgres host | localhost | — |
| DB_PORT | Postgres port | 5432 | — |
| DB_USER | Postgres user | postgres | — |
| DB_PASS | Postgres password | postgres | — |
| DB_NAME | Postgres database | postgres | — |
| DB_TEST_HOST | Test DB host | — | localhost |
| DB_TEST_PORT | Test DB port | — | 5432 |
| DB_TEST_USER | Test DB user | — | postgres |
| DB_TEST_PASS | Test DB password | — | postgres |
| DB_TEST_NAME | Test DB name | — | abilio |
| PORT | HTTP port | 3000 | — |

---

## 3. Users system

**Module:** `src/users/users.module.ts`  
**Entity:** `src/users/entities/user.entity.ts` (table `users`)  
**Controller:** `src/users/users.controller.ts` (base path: `/users`)  
**Service:** `src/users/users.service.ts`

### Entity: User

| Field | Type | Constraints |
|-------|------|-------------|
| id | uuid | PK, generated |
| email | string | unique |
| createdAt | timestamp | created_at |

**Relations:** One-to-many with `Location` (user has many locations).

### Service routines

| Routine | Input | Output | Behavior |
|---------|--------|--------|----------|
| **findById(id)** | uuid | User | Finds user by id; throws `NotFoundException` if not found. |

### HTTP routines (controller)

| Method | Path | Description | Response |
|--------|------|-------------|----------|
| GET | `/users/:id/last-location` | Last recorded location for user. | 200 + Location or null; 404 if user not found. |
| GET | `/users/:id/history` | All locations for user, newest first. | 200 + Location[]; 404 if user not found. |

**Flow:**
- Both routes validate `:id` as UUID (ParseUUIDPipe).
- Controller calls `usersService.findById(id)` then delegates to `locationsService.findLastByUserId(id)` or `findHistoryByUserId(id)`.

---

## 4. Locations system

**Module:** `src/locations/locations.module.ts`  
**Entity:** `src/locations/entities/location.entity.ts` (table `locations`)  
**Controller:** `src/locations/locations.controller.ts` (base path: `/locations`)  
**Service:** `src/locations/locations.service.ts`  
**DTO:** `src/locations/dto/create-location.dto.ts` (CreateLocationDto)

### Entity: Location

| Field | Type | Constraints |
|-------|------|-------------|
| id | uuid | PK, generated |
| userId | uuid | FK to users, onDelete CASCADE |
| latitude | float | — |
| longitude | float | — |
| createdAt | timestamp | created_at |

**Relations:** Many-to-one with `User`.

### DTO: CreateLocationDto (validation)

| Field | Validation |
|-------|------------|
| userId | IsUUID |
| latitude | IsNumber, Min(-90), Max(90) |
| longitude | IsNumber, Min(-180), Max(180) |

### Service routines

| Routine | Input | Output | Behavior |
|---------|--------|--------|----------|
| **create(dto)** | CreateLocationDto | Location | Ensures user exists via `usersService.findById(dto.userId)`; creates and saves location. |
| **findLastByUserId(userId)** | uuid | Location \| null | Single location for user with latest `createdAt`. |
| **findHistoryByUserId(userId)** | uuid | Location[] | All locations for user ordered by `createdAt` DESC. |

### HTTP routines (controller)

| Method | Path | Body | Description | Response |
|--------|------|------|-------------|----------|
| POST | `/locations` | CreateLocationDto | Create a location for a user. | 201 + Location; 400 if validation fails; 404 if user not found. |

**Flow:**
- Request body validated by global ValidationPipe.
- `LocationsService.create(dto)` checks user then persists location.

---

## 5. Admin system

**Module:** `src/admin/admin.module.ts`  
**Entity:** `src/admin/entities/admin.entity.ts` (table `admins`)  
**Controller:** `src/admin/admin.controller.ts` (base path: `/admin`)  
**Service:** `src/admin/admin.service.ts`  
**DTO:** `src/admin/dto/login-admin.dto.ts` (LoginAdminDto)

### Entity: Admin

| Field | Type | Constraints |
|-------|------|-------------|
| id | uuid | PK, generated |
| email | string | unique |
| password | string | stored hashed (bcrypt) |
| createdAt | timestamp | created_at |

**Note:** Admins are stored in a separate table from Users; no shared table.

### DTO: LoginAdminDto (validation)

| Field | Validation |
|-------|------------|
| email | IsEmail |
| password | IsString, MinLength(1) |

### Service routines

| Routine | Input | Output | Behavior |
|---------|--------|--------|----------|
| **hashPassword(plain)** | string | string | bcrypt hash (10 rounds). |
| **validatePassword(plain, hashed)** | string, string | boolean | bcrypt.compare. |
| **login(dto)** | LoginAdminDto | { success: true } | Finds admin by email; compares password; returns success or throws `UnauthorizedException`. |
| **findByEmail(email)** | string | Admin \| null | Lookup by email. |

### HTTP routines (controller)

| Method | Path | Body | Description | Response |
|--------|------|------|-------------|----------|
| POST | `/admin/login` | LoginAdminDto | Admin login (email + password). | 200 + { success: true }; 401 on invalid credentials; 400 on validation error. |

**Flow:**
- Body validated by ValidationPipe.
- `AdminService.login(dto)` looks up admin, verifies password with bcrypt, returns `{ success: true }` or throws.

---

## 6. Auth system

**Module:** `src/auth/auth.module.ts`

| Routine | Description |
|---------|-------------|
| — | Placeholder module; no controllers or providers. Prepared for future auth logic (e.g. JWT, guards). |

---

## 7. Module dependency overview

```
AppModule
├── ConfigModule (global)
├── TypeOrmModule (root)
├── UsersModule
│   └── forwardRef(LocationsModule)
├── LocationsModule
│   └── forwardRef(UsersModule)
├── AuthModule
└── AdminModule
```

**Circular dependency:** UsersModule ↔ LocationsModule (resolved with `forwardRef` in both imports and in LocationsService injection of UsersService).

---

## 8. Database schema summary

| Table | Key columns | Notes |
|-------|-------------|-------|
| users | id (uuid), email (unique), created_at | Referenced by locations.user_id |
| locations | id (uuid), user_id (uuid), latitude, longitude, created_at | FK to users, CASCADE on delete |
| admins | id (uuid), email (unique), password, created_at | Separate from users |

---

## 9. Testing routines

**E2E config:** `test/jest-e2e.json`  
**Setup:** `test/setup-e2e.ts` (sets `NODE_ENV=test` and `DB_TEST_*` defaults before tests load)

| Script | Config | Description |
|--------|--------|-------------|
| npm run test | jest (rootDir: src) | Unit tests (`*.spec.ts`); `--passWithNoTests`. |
| npm run test:e2e | test/jest-e2e.json | E2E tests (`*.e2e-spec.ts`); use test DB; 30s timeout. |

**E2E suites:**
- **app.e2e-spec.ts:** App boot; GET `/` → 404.
- **locations.e2e-spec.ts:** POST `/locations` (success + validation/404 cases); GET `/users/:id/last-location`; GET `/users/:id/history`; DB cleaned between tests via query builder delete.

---

## 10. Docker and run

**Compose:** repository root `docker-compose.yml`

| Service | Role |
|---------|------|
| postgres | Postgres 16; env from DB_*; healthcheck; volume for data. |
| backend | Builds from `abilio-solution/backend` Dockerfile; env DB_HOST=postgres, DB_*; depends on postgres healthy; restart unless-stopped. |

**Run:** From repo root: `docker-compose up --build` (or `-d` for detached).

---

## Quick reference: API endpoints

| Method | Path | Body / params | Purpose |
|--------|------|----------------|---------|
| POST | /locations | { userId, latitude, longitude } | Create location for user |
| GET | /users/:id/last-location | id (uuid) | Last location for user |
| GET | /users/:id/history | id (uuid) | Location history for user (newest first) |
| POST | /admin/login | { email, password } | Admin login (returns { success: true }) |

All request bodies are validated; invalid payloads return 400. User/admin not found or invalid credentials return 404 or 401 as described above.
