# Police Department Management Portal

A secure, modern, and high-performance police portal featuring a single unified login page with role-based access control for police staff and the commissioner (admin).

---

## Features

- **Single Unified Login**: Seamlessly authenticates staff and admin from a single page.
- **Role-Based Access Control**:
  - **Police Staff** (CI, SI, Constable, and other staff) can submit incident reports for their area and station, view their own submitted reports, and track their status.
  - **Commissioner (Admin)** can view all submitted reports, filter/search by area, station, priority, and status, sort reports, and transition report statuses.
- **Real-Time Stream**: Real-time notifications for the commissioner using Server-Sent Events (SSE).
- **Multi-language Support**: Translate report descriptions on the fly into English, Hindi, Telugu, Spanish, and French.
- **Analytics Dashboard**: Commissioner dashboard displaying active officers, total reports, high-priority issues, and incident stats per area.
- **Modern Premium Interface**: Responsive, glassmorphic dark-blue interface utilizing modern typography and CSS.

---

## Folder Structure

- `client/` — React frontend built with Vite
- `server/` — Node.js + Express backend with SQLite for development
- `postgres-schema.sql` — Production-ready PostgreSQL schema

---

## Run Locally

### 1. Install Dependencies

Open a terminal in the root directory (`c:\police`) and run:

```bash
npm install
```

*This will automatically trigger `npm install` in both the `client/` and `server/` subfolders via a postinstall hook.*

### 2. Run in Development Mode

To run both the backend server and the frontend client concurrently with hot reloading, execute:

```bash
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:4000`

### 3. Build & Run in Production Mode

To build the optimized client bundle and serve it statically via the Express server, run:

```bash
npm run build:client
npm run start:server
```

- Access the full application at: `http://localhost:4000`

---

## Demo Login Credentials

### Staff Accounts
- **Circle Inspector (CI)**: `ci001` / `passCI`
- **Sub-Inspector (SI)**: `si001` / `passSI`
- **Constable**: `const001` / `passConst`
- **Other Staff**: `staff001` / `passStaff`

### Commissioner Account
- **Admin**: `commissioner` / `admin123`

---

## API Structure

- `POST /api/auth/login` — Authenticate staff or admin.
- `GET /api/reports/my` — Get current logged-in staff member's reports.
- `POST /api/reports` — Submit a new report (staff only).
- `GET /api/reports` — Get all reports with optional filters (admin only).
- `PATCH /api/reports/:id/status` — Update report status (admin only).
- `GET /api/reports/stream` — Real-time Server-Sent Events (SSE) stream (admin only).

---

## Database Configuration

- **Development**: Uses a local SQLite database stored at `server/data/app.db`.
- **Production**: Use `postgres-schema.sql` to initialize your database structure when deploying with PostgreSQL. Make sure to update the environment variables to connect to your PostgreSQL instance.