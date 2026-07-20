# Frontend Architecture

## Stack and configuration

The application uses React 19, React DOM, TypeScript 6, React Router 7, and Vite 8. It has no external state, form, validation, HTTP, or component library. ESLint uses the flat configuration with the recommended JavaScript, TypeScript, React Hooks, and React Refresh rules.

TypeScript uses project references for browser code (`tsconfig.app.json`) and Vite configuration (`tsconfig.node.json`). Both configurations are no-emit and reject unused locals, unused parameters, and switch fallthrough. Vite enables the React plugin and proxies `/api` to `http://localhost:3001` during development. `VITE_API_URL` can replace the `/api` client base URL.

## Composition and routing

`index.html` provides `#root`. `src/main.tsx` imports global CSS and mounts `App` inside React `StrictMode`. `src/app/index.tsx` places `RouterProvider` inside `AuthProvider`.

`src/app/router.tsx` defines:

- `/login`: login page;
- `/contracts`: protected management page;
- `/contracts/add`: the same page with the create modal;
- `/contracts/:id/edit`: the same page with an edit modal;
- `/contracts/:id/delete`: the same page with a delete modal;
- all other paths: redirect to `/contracts`.

`ProtectedRoute` renders an outlet when authenticated and otherwise replaces the route with `/login`. An authenticated visit to `/login` redirects to `/contracts`.

## Source structure

- `src/app`: application composition and router.
- `src/routes`: the protected-route wrapper.
- `src/features/auth`: login API, form and page, auth context and hook, token storage, and types.
- `src/features/clients`: client API, form, list, and types.
- `src/features/contracts`: contract API, page, forms, lists, modal wrappers, summary, status badge, and types.
- `src/lib`: the shared fetch-based API client.
- `src/styles`: the global visual rules.

`ContractsPage` is the main coordinator. It owns client, contract, summary, loading, and error state; loads the three datasets; resolves the contract referenced by edit or delete routes; and refreshes contracts and the summary after contract mutations. Components own form submission and action feedback. There is no shared application store beyond authentication and no separate general-purpose hooks layer.

## Backend communication

All feature API modules call `apiRequest`. The client sets `Content-Type: application/json` when a body is present, attaches the bearer token when available, parses successful non-204 responses as JSON, and returns `undefined` for `204`. Non-success responses become `ApiError` instances with the HTTP status; network failures become a connection error.

Implemented endpoints are:

- `POST /auth/login`;
- `GET` and `POST /clients`;
- `GET` and `POST /contracts`;
- `GET /contracts/summary`;
- `GET`, `PUT`, and `DELETE /contracts/:id`;
- `PATCH /contracts/:id/close`.

## Authentication and state

`AuthProvider` initializes authentication from the presence of `localStorage.auth_token`. Login stores the token returned by the API. Logout removes it. The provider configures the shared API client to read the current token and log out after any `401`; route guards then redirect unauthenticated users.

Clients, contracts, summary data, and all loading or feedback flags use local React state. Initial data fetching is performed with effects. Contracts and summary are refreshed concurrently after create, update, close, or delete and through the manual refresh action.

## Forms and feedback

Forms use controlled inputs and explicit submit handlers with browser validation disabled. Login requires trimmed username and password. Client creation requires trimmed name and document. Contract create/edit requires all fields and a finite numeric value greater than zero. Submitting controls are disabled and their labels show progress; contract controls are also disabled when no clients exist.

Client and contract lists render loading, error, and empty states; the summary renders loading and error states and renders nothing when no data is returned. Mutations display inline success or error messages; closing uses browser confirmation, while deletion uses a route-driven confirmation modal. Contract values are formatted as BRL, due dates as `pt-BR` in UTC, and statuses as localized badges.

## Styling

`src/styles/global.css` defines the entire visual system: page shells, sections, grids, forms, tables, buttons, modals, feedback colors, status badges, and a responsive breakpoint at `45rem`. Components use semantic elements and ARIA labels, alert/status roles, and dialog attributes where implemented.

## Validation

There are no automated test files and no test script. Project validation commands are:

```bash
npm run lint
npm run build
```

`npm run build` runs `tsc -b` before the Vite production build.
