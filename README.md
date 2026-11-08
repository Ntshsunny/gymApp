# GymFlow: Gym Workout App

Mobile-first gym workout tracker with accounts.

| Layer    | Tech                                  |
|----------|---------------------------------------|
| Backend  | Java 17, Spring Boot 3.3 (REST, JPA)  |
| Frontend | Angular 18 (standalone components)    |
| Database | IBM DB2 (Community Edition in Docker) |

## Features
- **Login**: create an account and sign in; every user has their own plan, history, exercises and stats. Passwords are BCrypt-hashed, sessions are random tokens (stored hashed, 30-day expiry). New accounts get an editable sample weekly plan.
- **Today** tab: today's exercises (sets x reps, weight, duration) with a tap-to-complete circle. Use the ‹ Today › buttons to open any past day and log or fix it.
- **Plan** tab: Monday to Sunday routine; add or remove exercises per day.
- **History** tab: last 30 days, each with a progress ring. Tap a day to open it.
- **My exercises** tab: your personal exercise library. Add your own exercises (name, your own category or an existing muscle group, video link, notes), schedule them in your Plan, and delete them when no longer needed. Built-in exercises are shared and read-only.
- **Stats** tab: ring charts for the week, today, each day of the week and muscle-group focus, plus a streak counter.
- **Video links**: every exercise has a ▶ button that opens its sample video.

## Run it

### 1. Database (DB2)
```bash
docker compose up -d
# first start takes a few minutes; wait until the log shows "Setup has completed"
docker logs -f gym-db2
```
Tables are created automatically by Hibernate on backend start-up.
If you ran an earlier version of this app against the same database, reset it first with `docker compose down -v` (the schema now has users).

### 2. Backend
```bash
cd backend
mvn spring-boot:run
```
Runs on http://localhost:8080. Connection settings are in `backend/src/main/resources/application.yml`
(override with env vars `DB2_HOST`, `DB2_PORT`, `DB2_NAME`, `DB2_USER`, `DB2_PASSWORD`, `DB2_SCHEMA`).
The built-in exercise library is seeded on first run (`app.seed-data: true`).

### 3. Frontend
```bash
cd frontend
npm install
npm start
```
Open http://localhost:4200 and create an account. Use your browser's mobile view, or open `http://<your-computer-IP>:4200` on a phone on the same Wi-Fi.

## REST API
All endpoints except `/api/auth/register` and `/api/auth/login` need `Authorization: Bearer <token>`.

| Method | Path                             | Purpose                                         |
|--------|----------------------------------|-------------------------------------------------|
| POST   | `/api/auth/register`             | Create account, returns token                   |
| POST   | `/api/auth/login`                | Sign in, returns token                          |
| POST   | `/api/auth/logout`               | End the session                                 |
| GET    | `/api/routines/day?date=`        | Workout list for a date (default today)         |
| GET    | `/api/routines/week`             | Current week grouped by day                     |
| POST   | `/api/routines`                  | Add exercise to a day                           |
| PUT    | `/api/routines/{id}`             | Edit a routine item                             |
| DELETE | `/api/routines/{id}`             | Remove a routine item (and its history)         |
| POST   | `/api/routines/{id}/toggle?date=`| Mark done / not done on a date (past allowed)   |
| GET    | `/api/exercises`                 | Built-in + your own exercises                   |
| POST   | `/api/exercises`                 | Add your own exercise                           |
| DELETE | `/api/exercises/{id}`            | Delete your own exercise (not if it's in a plan)|
| GET    | `/api/history?days=30`           | Day-by-day completion, newest first             |
| GET    | `/api/stats`                     | Data for the ring charts                        |

## Good to know
- History compares what you completed against your **current** plan. If you change the plan, older days are measured against the new plan, and deleting a plan item also removes its completion records.
- Video links must start with `http://` or `https://`. Seeded links are YouTube searches so they never break; replace them with specific videos via the My exercises tab or `DataSeeder.java`.
- For production, serve both apps over HTTPS and set `app.cors-origins` to your real frontend URL.

## Making it a real phone app
Wrap the Angular build with [Capacitor](https://capacitorjs.com):
```bash
cd frontend
npm i @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios
npx cap init GymFlow com.gymtracker.app --web-dir=dist/gym-frontend/browser
npm run build && npx cap add android && npx cap sync
```
Then change `API` in `src/app/config.ts` to your deployed backend URL.

## Project layout
```
gym-app/
├── docker-compose.yml        # DB2
├── backend/                  # Spring Boot (model, repository, service, controller, dto, config)
└── frontend/                 # Angular (pages: login, today, plan, history, library, stats)
```
