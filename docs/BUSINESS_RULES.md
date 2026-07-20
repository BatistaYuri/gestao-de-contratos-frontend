# Implemented Business Rules

## Authentication and access

- Login requires both username and password. The username is trimmed before `POST /auth/login`; the password is sent unchanged.
- A successful response must contain a token. The token is saved as `localStorage.auth_token`, and the user is treated as authenticated while that value exists.
- Invalid credentials (`401`) show a specific message. Other login failures show a connection message.
- Unauthenticated users cannot access contract routes and are redirected to `/login`. Authenticated users opening `/login` are redirected to `/contracts`.
- Every API request sends the stored token as a bearer token when present. Any `401` response removes the token and ends the authenticated session.
- The **Sair** action removes the token; the protected route then redirects to login.

## Clients

- The page loads and lists each client's name and document. Loading, load failure, and empty-list states are shown separately.
- Client creation requires non-blank name and document values; both are trimmed before submission.
- On success, the returned client is appended to the displayed list, the form is cleared, and a success message is shown.
- A `409` reports that the document is already registered. Other API and connection failures are displayed.

## Contracts

- The page loads contracts and a summary independently. The summary displays active, expired, closed, and total counts returned by the API.
- The list displays number, client name, BRL-formatted value, UTC-based `pt-BR` due date, and localized status: active, expired, or closed.
- A contract can be created only when at least one client is loaded. The **Novo contrato** action and all contract form controls are disabled when the client list is empty.
- Create and edit require a non-blank contract number, client, value, and due date. The number is trimmed; value must be finite and greater than zero. The submitted value is numeric and the due date uses the date input value.
- Edit and delete routes load the selected contract by ID before opening their modal. Missing and failed contract loads produce distinct messages.
- Successful creation and editing refresh both the contract list and summary before closing the modal.
- Closing is available only for contracts whose status is not `CLOSED`. It requires browser confirmation, disables all row actions while processing, and refreshes contracts and summary on success.
- Deletion requires confirmation in a modal. Its cancel and delete controls are disabled while deletion is running. Success refreshes contracts and summary before the modal closes.
- Edit and delete remain available for every listed status.
- A `409` during create or edit reports a duplicate contract number. Other API errors use the shared HTTP-status message; connection failures use a connection message.
- Manual refresh reloads contracts and the summary concurrently and is disabled while either is loading.

## Feedback and action state

- Login, client, contract, close, and delete submissions prevent duplicate action through disabled controls and progress labels.
- Client, contract, and summary loads have explicit loading and error feedback. Client and contract lists also show explicit empty states.
- Success messages use status semantics; validation and operation failures use alert semantics where implemented.
