# DEVELOPMENT

This document explains how to run the full stack **from zero**:

- PostgreSQL (Docker)
- Nest backend (Docker, auto-migrations + auto-seed)
- Admin web (served by backend at `/dashboard`)
- Mobile app (Expo)

---

## Prerequisites

- Docker Desktop (or Docker Engine) + Docker Compose
- Node.js (recommended: 18+)
- (Optional) Expo Go app on your phone (for the mobile app)

---

## 1) Run everything with Docker (recommended)

From the repository root:

```bash
sudo docker compose up -d --build
```

What happens on container start:

- Backend runs TypeORM **migrations** automatically.
- Backend runs the **seed** automatically (can be disabled with `RUN_SEED=false`).

### URLs

- **Backend API**: `http://localhost:3000`
- **Admin dashboard** (React build): `http://localhost:3000/dashboard`

### Seeded credentials (default)

After the container starts, the seed creates:

- **Admin**: `admin@example.com` / `admin123`
- **User**: `porto@test.com` / `123456`
- **Sample trajectory**: ~40 locations for the `porto@test.com` user

### Troubleshooting

- **Rebuild from scratch**:

```bash
sudo docker compose down
sudo docker compose up -d --build
```

- **Disable auto-seed**:
  - Set `RUN_SEED=false` in `docker-compose.yml` (backend service environment), then rebuild.

---

## 2) Run without Docker (local dev)

### 2.1 Start PostgreSQL

Use the provided `docker-compose.yml` but start only the database:

```bash
sudo docker compose up -d postgres
```

### 2.2 Backend (Nest)

```bash
cd abilio-solution/backend
npm install
cp .env.example .env
```

Edit `abilio-solution/backend/.env` to point to your Postgres.

Then:

```bash
npm run migration:run
npm run seed
npm run start:dev
```

Backend will be on `http://localhost:3000`.

### 2.3 Admin (React, Vite)

You can run the admin in dev mode:

```bash
cd abilio-solution/admin
npm install
cp .env.example .env
npm run dev
```

Or access the **built admin** from the backend at `/dashboard` when using Docker.

---

## 3) Mobile App (Expo)

From the repo root:

```bash
cd abilio-solution/app
npm install
```

Create `abilio-solution/app/.env`:

```env
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_CAT_API_KEY=YOUR_CAT_API_KEY
```

Start Expo:

```bash
npx expo start
```

### If using a physical phone

Set `EXPO_PUBLIC_API_URL` to your machine LAN IP, e.g.:

- `http://192.168.1.50:3000`

Your phone must be on the same network.

---

## Notes

- The admin uses a simple token header: `x-admin-token`.
- For Google Maps in the admin UI, you must provide a valid Google Maps **JavaScript API** key in `abilio-solution/admin/.env`.
  To draw trajectories **along streets** (not straight cuts), enable **Roads API** on the same Google Cloud project (Snap to Roads uses the same API key):

```env
VITE_GOOGLE_MAPS_API_KEY=AIza...
```

