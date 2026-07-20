# AI Agent Operating Contract

## Purpose

This file defines how AI agents must work in this frontend repository. Base every change solely on the current source, configuration, and tests, without assuming backend behavior.

## Current application

- React 19 and React DOM, TypeScript 6, Vite 8, and React Router 7.
- A single global CSS file provides the visual system; there is no UI framework or CSS-in-JS layer.
- `src/main.tsx` mounts `App`; `App` composes `AuthProvider` and `RouterProvider`.
- `/login` is public. `/contracts` and its add, edit, and delete modal routes are protected. Unknown paths redirect to `/contracts`.
- The protected screen loads clients, contracts, and the contract status summary. It supports client creation and contract creation, editing, closing, and deletion.

## Responsibilities and boundaries

- `src/features/*/pages` compose complete screens and coordinate route-driven state and data loading.
- `src/features/*/components` render forms, lists, summaries, badges, and modals, and own local UI state.
- `src/features/*/api` defines feature-specific backend calls through `src/lib/api-client.ts`.
- `src/features/*/types` defines the API-facing data shapes used by the UI.
- The auth context is the only shared state layer. `useAuth` is its consumer hook; other data remains page or component state.
- `src/routes/ProtectedRoute.tsx` enforces authentication for protected routes.

Inspect the relevant source, configuration, and existing tests before editing. Preserve user changes and keep edits limited to the request. Do not implement unrequested features or speculative abstractions. Do not change API contracts, dependencies, architecture, routing conventions, or the styling approach without explicit authorization.

## Existing behavior to preserve

- Authentication uses `POST /auth/login` with `username` and `password`. The returned token is stored in `localStorage` under `auth_token`.
- The shared API client uses `VITE_API_URL`, falling back to `/api`, sends JSON for request bodies, and adds `Authorization: Bearer <token>` when a token exists.
- Any API `401` invokes logout, which removes the stored token and makes protected routes redirect to `/login`.
- Forms use controlled fields and local validation. Keep `noValidate`, disabled/submitting states, trimmed text handling, status-specific messages, and current API payload shapes unless the request requires a change.
- Preserve existing loading, empty, success, and error states. `ApiError` carries HTTP status; unexpected fetch failures use connection-error feedback.
- Follow the existing feature-based structure, Portuguese UI terminology, semantic HTML, accessibility attributes, modal route pattern, and classes in `src/styles/global.css`.

## Validation

The repository currently has no automated test files or test script. Available commands are:

```bash
npm run lint
npm run build
```

Run both after source or configuration changes. For documentation-only changes, review the Markdown and repository diff; do not run build or lint unless requested. `npm run dev` starts Vite and `npm run preview` serves the production build, but neither is a validation command.

## Completion report

Report:

- files created or modified and a concise behavior-level summary;
- tests added or changed, or state that none were involved;
- validation commands run and their results, or why they were not run;
- browser, accessibility, visual, or backend integration behavior not verified.

Never create commits or push changes unless explicitly requested.
