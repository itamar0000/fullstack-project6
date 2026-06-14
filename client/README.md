# Project5 Advanced React REST App

React application for the JavaScript and React learning scope: auth, forms, routing, effects, data fetching, CRUD, client caching, and JSON Server data.

## Run

```bash
npm install
npm run server
npm run dev
```

Open the Vite URL printed by `npm run dev`. The API defaults to `http://localhost:3001`.

## Demo Users

The password is the user's `website` value, per the project requirements.

- Username: `Bret`, password: `hildegard.org`
- Username: `Antonette`, password: `anastasia.net`
- Username: `Samantha`, password: `ramiro.info`

## Features

- Login and registration with React Hook Form.
- Auth state persisted in Local Storage.
- Guarded routes and ownership checks for `/users/:userId/...`.
- Todos CRUD with search, sort, inline title editing, and completion toggles.
- Posts CRUD with selected detailed view and comments CRUD limited to the current user's comments.
- Albums CRUD and paged photo loading with add, update, and delete.
- Fetch-based API client with GET caching, plus Axios for paged photo requests.

## Responsibility Separation

- `src/App.jsx` wires global providers only.
- `src/routes/AppRouter.jsx` owns the route tree.
- `src/routes/paths.js` owns all route strings and URL builders.
- `src/routes/AuthenticatedRoute.jsx` protects logged-in pages.
- `src/routes/CurrentUserRoute.jsx` prevents access to another user's URL data.
- `src/layouts/AppLayout.jsx` owns the header, navigation, logout, and shared page frame.
- `src/pages/` owns page-level screens.
- `src/features/` owns feature-specific hooks, view helpers, and feature UI.
- `src/api/` owns server communication and client caching.
- `src/context/` owns global React state such as authentication.
- `src/components/` owns reusable UI pieces that are not routes or pages.

## State And Function Leveling

- Pages compose feature pieces and only keep orchestration that crosses concerns, such as selecting a new post after creating it.
- Server/resource state lives in feature hooks such as `useTodos`, `usePosts`, `usePostComments`, `useAlbums`, and `useAlbumPhotos`.
- Search, sort, and derived list state lives in feature filter hooks.
- Temporary form state lives in the form component that uses it.
- Temporary edit state lives in the row/card/detail component being edited.
- API functions stay in `src/api`; ownership/security checks stay in the feature hooks before mutations run.
