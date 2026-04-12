# Mess Management System

A web-based platform for managing college hostels, PG accommodations, and small residential messes — handling meal bookings, daily cost tracking, monthly billing, and shared household expenses.

## Overview

The Mess Management System automates the day-to-day operations of a residential mess:

- Members are auto-booked for meals each day (opt-out model) and can cancel individual slots
- Managers log daily ingredient costs; the system computes a **Cost Per Meal** at month-end
- Item allocations (eggs, milk, etc.) are tracked and billed individually per Member
- Fixed monthly charges and shared household bills (rent, utilities, internet) are split among Members and Managers
- Itemized PDF invoices are generated for each Member every month

## Features

- Automated daily meal booking with opt-out cancellation
- Daily cost logging with automatic monthly summation
- Hybrid billing: meal costs + item allocations + fixed charges + shared bills
- PDF invoice generation
- Join request and mess-deletion approval workflows
- Email notifications via Gmail SMTP
- Swagger API documentation
- Bilingual UI — English and Bengali (frontend only)
- Light and dark theme support
- Three user roles: **Member**, **Manager**, and **Admin**

## Tech Stack

| Layer | Technology |
|---|---|
| Backend framework | NestJS v11 |
| Database | PostgreSQL |
| ORM | TypeORM v0.3 |
| Auth | JWT + Passport.js (access & refresh tokens) |
| Email | Nodemailer (Gmail SMTP) |
| Frontend / Admin UI | React 19, React Router v7, Vite |
| Styling | Tailwind CSS v4 |
| State management | Redux Toolkit |
| Forms & validation | React Hook Form + Zod |
| HTTP client | Axios |
| Language | TypeScript (all workspaces) |

## Project Structure

```
mess-management/
├── backend/      # NestJS REST API
├── frontend/     # Member & Manager web app (EN + BN)
└── admin/        # Admin dashboard
```

## Prerequisites

- Node.js v20 or later
- PostgreSQL
- A Gmail account with an [app-specific password](https://support.google.com/accounts/answer/185833) for SMTP

## Getting Started

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env   # fill in the values (see Environment Variables below)

npm run migration:run  # apply database migrations
npm run seed           # optional: seed initial data

npm run start:dev      # http://localhost:3000/api
```

API docs (Swagger): [http://localhost:3000/api/docs](http://localhost:3000/api/docs)

### 2. Frontend (User Web App)

```bash
cd frontend
npm install
cp .env.example .env   # set VITE_API_URL

npm run dev            # http://localhost:5173
```

### 3. Admin Dashboard

```bash
cd admin
npm install
cp .env.example .env   # set VITE_API_URL

npm run dev            # http://localhost:5177
```

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `NODE_ENV` | `development` or `production` |
| `JWT_SECRET` | Access token signing key (min 32 chars) |
| `JWT_REFRESH_SECRET` | Refresh token signing key (min 32 chars) |
| `JWT_EXPIRY` | Access token lifetime (e.g. `15m`) |
| `JWT_REFRESH_EXPIRY` | Refresh token lifetime (e.g. `7d`) |
| `PORT` | Server port (default `3000`) |
| `FRONTEND_URL` | User app origin for CORS (e.g. `http://localhost:5173`) |
| `ADMIN_FRONTEND_URL` | Admin app origin for CORS (e.g. `http://localhost:5177`) |
| `GMAIL_USER` | Gmail address for SMTP |
| `GMAIL_PASSWORD` | Gmail app-specific password |

### Frontend & Admin (`frontend/.env`, `admin/.env`)

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API base URL (e.g. `http://localhost:3000/api`) |

## Available Scripts

### Backend

| Script | Description |
|---|---|
| `npm run start:dev` | Start with watch mode |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run start:prod` | Run compiled build |
| `npm run migration:run` | Apply pending migrations |
| `npm run migration:generate` | Generate a new migration |
| `npm run migration:revert` | Revert the last migration |
| `npm run seed` | Seed the database |
| `npm run test` | Run unit tests |
| `npm run test:e2e` | Run end-to-end tests |
| `npm run lint` | Lint and auto-fix |

### Frontend & Admin

| Script | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build |
| `npm run typecheck` | TypeScript type check |

## User Roles

| Role | Description |
|---|---|
| **Member** | Resident of a mess; books/cancels meals, views bills and invoices |
| **Manager** | Runs a mess; logs costs, publishes meal slots, manages members and billing |
| **Admin** | Platform administrator; oversees all messes, approves creations/deletions, manages users |
