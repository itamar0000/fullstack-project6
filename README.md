# Project 6 — Full-Stack Client / Server with REST API

Full-stack application built for Chapter 6 (Units 13–18) of the Full-Stack Web
Development course. It re-implements a `jsonplaceholder`-style REST service with
a **real database backend** and connects it to the React client from Project 5.

- **Client** — React + Vite (login, register, todos, posts, comments, albums, photos)
- **Server** — Node.js + Express REST API
- **Database** — MySQL 8

```
React client  ──HTTP──▶  Express server  ──SQL──▶  MySQL database
 (port 5173)             (port 3001)               (port 3306, db "proj6")
```

---

## Prerequisites

- **Node.js** 18+ (developed on Node 24)
- **MySQL** 8.x server running locally

---

## Setup & Run

### 1. Database + Server

```bash
cd server
npm install
npm run init-db     # creates the "proj6" database, tables, and seed data
npm start           # starts the API on http://localhost:3001
```

> **MySQL credentials:** the server defaults to `root` with an empty password on
> `127.0.0.1:3306`. If your MySQL differs, copy `server/.env.example` to
> `server/.env` and set `DB_USER` / `DB_PASSWORD` / etc. (`npm run init-db`
> reads the same config).

### 2. Client

```bash
cd client
npm install
npm run dev         # opens the app on http://localhost:5173
```

The client talks to `http://localhost:3001` by default. To point it elsewhere,
set `VITE_API_BASE_URL` before `npm run dev`.

---

## Demo Users

Seeded accounts (password is stored in the secured `user_passwords` table):

| Username  | Password        |
|-----------|-----------------|
| `Bret`    | `hildegard.org` |
| `Antonette` | `anastasia.net` |
| `Samantha`  | `ramiro.info`   |
| `Eitan`   | `1111`          |
| `itamar`  | `123456`        |

You can also create a new account from the **Register** page.

---

## Database Schema

| Table             | Purpose                                            |
|-------------------|----------------------------------------------------|
| `users`           | User profiles (name, username, email, address, …)  |
| `user_passwords`  | Passwords, kept in a separate, access-restricted table (FK → `users`) |
| `todos`           | Todos, each linked to a user                       |
| `posts`           | Posts, each linked to a user                       |
| `comments`        | Comments, each linked to a post                    |
| `albums`          | Albums, each linked to a user                      |
| `photos`          | Photos, each linked to an album                    |

All child tables use `ON DELETE CASCADE` foreign keys. Passwords are never
returned by any `/users` endpoint — login is verified server-side.

---

## REST API

Base URL: `http://localhost:3001`

Every resource supports the full set of REST operations:

| Method   | Path                  | Description                          |
|----------|-----------------------|--------------------------------------|
| `GET`    | `/users`              | List users (`?username=&website=` verifies login) |
| `GET`    | `/users/:id`          | Single user                          |
| `POST`   | `/users`              | Register a new user                  |
| `PUT`/`PATCH` | `/users/:id`     | Update a user                        |
| `DELETE` | `/users/:id`          | Delete a user                        |
| `GET`    | `/todos?userId=`      | List / filter todos                  |
| `GET`    | `/posts?userId=`      | List / filter posts                  |
| `GET`    | `/comments?postId=`   | List / filter comments               |
| `GET`    | `/albums?userId=`     | List / filter albums                 |
| `GET`    | `/photos?albumId=&_page=&_limit=` | Paged photos (`X-Total-Count` header) |

`POST`, `PUT`, `PATCH`, `DELETE` follow the same pattern for `todos`, `posts`,
`comments`, `albums`, and `photos`. Test them with Postman or the client UI.

---

## Project Structure

```
fullstack-project6/
├── client/                 # React + Vite front-end
│   └── src/
│       ├── api/            # API client + per-resource request functions
│       ├── context/        # Auth (login/register/logout, Local Storage)
│       ├── routes/         # Guarded routes, informative URLs
│       ├── pages/          # Login, Register, Home, Todos, Posts, Albums
│       └── features/       # todos / posts / comments / albums / photos
├── server/                 # Express + MySQL back-end
│   ├── config.js           # DB connection config (env-overridable)
│   ├── server.js           # Process entry point (app.listen)
│   ├── app.js              # Express app: middleware + route mounting
│   ├── db/                 # DB connection + one-time setup
│   │   ├── pool.js         # MySQL connection pool
│   │   ├── init.js         # `npm run init-db` entry: schema → seed → migrations
│   │   ├── schema.js       # CREATE TABLE definitions
│   │   ├── seed.js         # Demo data (fresh database only)
│   │   └── migrations.js   # Legacy-data fixups + ensure-admin
│   ├── middleware/         # Auth (JWT verify, admin guard)
│   ├── repositories/       # All SQL — one module per table
│   ├── routes/             # One HTTP router per resource
│   └── utils/              # Pagination helpers + user row→DTO mapper
└── start.ps1               # Windows helper: starts MySQL + the server
```

---

## Requirements Coverage

- **Stage A** — MySQL database for users, todos, posts, comments (+ albums,
  photos) with a separate, restricted `user_passwords` table.
- **Stage B** — Node.js + Express server with dedicated DB functions and REST
  routes (`GET`/`POST`/`PUT`/`DELETE`) mirroring `jsonplaceholder`.
- **Stage C** — React `/login` and `/register` pages, Local Storage session,
  **Info** and **Logout** buttons, informative URLs (`/users/:id/posts`).
- **Stage D** — Todos: list (sorted, with completion checkbox), add, update, delete.
- **Stage E** — Posts & Comments with ownership checks for update/delete.
- **Extra** — Albums & Photos (with paginated photo loading).
