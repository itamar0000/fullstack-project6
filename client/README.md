# Project 6 — React Client

React + Vite front-end for Project 6. It talks to the Express + MySQL server
in [`../server`](../server) over a REST API.

## Run

```bash
npm install
npm run dev
```

Opens on `http://localhost:5173` and calls the API at `http://localhost:3001`
(override with `VITE_API_BASE_URL`). **Start the server first** — see the
[top-level README](../README.md) for full setup, demo users, and API docs.

## Features

- Login / registration with React Hook Form; session persisted in Local Storage.
- Guarded routes and ownership checks for `/users/:userId/...` URLs.
- **Info** modal (profile without password) and **Logout** in the header.
- Todos CRUD with search, sort, inline editing, and completion toggles.
- Posts CRUD with a detail view and comments CRUD (limited to the current user).
- Albums CRUD with paged photo loading (add / update / delete).

## Structure

- `src/App.jsx` — wires global providers.
- `src/routes/` — route tree, path builders, and route guards.
- `src/layouts/AppLayout.jsx` — header, navigation, Info, Logout.
- `src/pages/` — page-level screens.
- `src/features/` — feature hooks, view helpers, and UI per resource.
- `src/api/` — server communication and client-side GET caching.
- `src/context/` — authentication state.
- `src/components/` — reusable UI pieces.
