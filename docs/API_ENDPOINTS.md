# Backend API Endpoints

## Conventions

- API prefix: `/api`
- Login and health check are public.
- Other routes require `Authorization: Bearer <token>`.
- Requests with a body use `Content-Type: application/json`.
- Parameters named `:id` must be UUIDs.
- Decimal values may be returned as JSON strings.

## Application

### Health check

```http
GET /api/health
```

Public. Returns the application health state.

## Authentication

### Login

```http
POST /api/auth/login
```

Public. Accepts the configured authentication credentials and returns a JWT in `token`.

## Clients

All routes require authentication.

### Create client

```http
POST /api/clients
```

```json
{
  "name": "Company name",
  "document": "Document number"
}
```

Returns `201 Created`.

### List clients

```http
GET /api/clients?page=1&pageSize=20
```

`page` starts at 1. `pageSize` defaults to 20 and accepts at most 100.
Returns `200 OK` with `data` and `pagination`:

```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

### Get client

```http
GET /api/clients/:id
```

Returns `200 OK` or `404 Not Found`.

### Update client

```http
PUT /api/clients/:id
```

```json
{
  "name": "Updated company name",
  "document": "Document number"
}
```

Returns `200 OK`.

### Delete client

```http
DELETE /api/clients/:id
```

Soft deletion. Returns `204 No Content`. Returns `409 Conflict` when the client has non-deleted contracts.

## Contracts

All routes require authentication. Contract items are created and replaced through the contract payload; there are no separate item endpoints.

### Contract write payload

```json
{
  "number": "Contract number",
  "clientId": "Client UUID",
  "type": "SERVICE",
  "dueDate": "2030-12-31",
  "currency": "BRL",
  "discount": "100.00",
  "additionalFees": "25.00",
  "items": [
    {
      "description": "Item description",
      "quantity": "2.500",
      "unitPrice": "1000.30"
    }
  ]
}
```

Rules:

- `items` is required and must contain at least one item.
- `description` is required.
- `quantity` must be greater than zero and have at most three decimal places.
- `unitPrice` must be zero or greater and have at most two decimal places.
- Do not send `subtotal` or `value`.
- The backend calculates `subtotal` and `value = subtotal - discount + additionalFees`.

### Create contract

```http
POST /api/contracts
```

Uses the contract write payload. Returns `201 Created`.

### List contracts

```http
GET /api/contracts?status=ACTIVE&page=1&pageSize=20
```

Optional, combinable query parameters:

- `status`
- `type`
- `approvalStatus`
- `clientId`
- `page` (starts at 1; defaults to 1)
- `pageSize` (defaults to 20; maximum 100)

Returns `200 OK` with contracts in `data` and the same `pagination` metadata
documented for the client list. Contract records include clients, items, and
calculated totals.

### Contract summary

```http
GET /api/contracts/summary
```

```json
{
  "active": 2,
  "expired": 1,
  "closed": 3,
  "total": 6
}
```

### Get contract

```http
GET /api/contracts/:id
```

Returns the contract with its client, items, `subtotal`, and `value`.

### Update contract

```http
PUT /api/contracts/:id
```

Uses the complete contract write payload and replaces all existing items. The backend recalculates the totals in the same transaction. Only `DRAFT` and `REJECTED` contracts can be updated.

### Delete contract

```http
DELETE /api/contracts/:id
```

Soft deletion. Returns `204 No Content`.

### Close contract

```http
PATCH /api/contracts/:id/close
```

Only approved, non-closed contracts can be closed.

## Approval workflow

### Submit for approval

```http
PATCH /api/contracts/:id/submit
```

Allowed for `DRAFT` and `REJECTED` contracts. Changes the approval status to `PENDING` and creates a revision snapshot.

### Approve contract

```http
PATCH /api/contracts/:id/approve
```

Allowed only for `PENDING` contracts. Changes the approval status to `APPROVED`.

### Reject contract

```http
PATCH /api/contracts/:id/reject
```

```json
{
  "reason": "Rejection reason"
}
```

The reason is required. Allowed only for `PENDING` contracts. Changes the approval status to `REJECTED`.

### Approval history

```http
GET /api/contracts/:id/approval-history
```

Returns revisions in ascending version order. Each revision contains the submitted contract snapshot, including items and totals.

## Enums

```text
ContractStatus: ACTIVE | EXPIRED | CLOSED
ContractType: SERVICE | SUPPLY | RENTAL | OTHER
ApprovalStatus: DRAFT | PENDING | APPROVED | REJECTED
```

Approval transitions:

```text
DRAFT -> PENDING
REJECTED -> PENDING
PENDING -> APPROVED
PENDING -> REJECTED
```

## HTTP statuses

- `200 OK`: successful query or update.
- `201 Created`: successful creation.
- `204 No Content`: successful deletion.
- `400 Bad Request`: invalid UUID, body, query, or field.
- `401 Unauthorized`: missing, invalid, or expired token.
- `404 Not Found`: resource not found or deleted.
- `409 Conflict`: duplicate data or invalid state transition.
- `500 Internal Server Error`: unexpected error.

Validation errors may include `message` and an `issues` array containing `expected`, `code`, `path`, and `message`.
