# Demo Backend API

This standalone Express API provides an in-memory REST contract and seed data
for local development. It does **not** connect to MongoDB or any other database.
Restarting the process resets changes to the seed data.

## Run locally

```bash
npm install
npm run dev
```

The API listens on `http://localhost:4000/api/v1` by default. Override `PORT`
with a local environment variable if needed. Copy `.env.example` only when
using a local env-file loader; no secret or database connection string is
required.

```bash
npm test
npm run build
npm start
```

## Model design

IDs are exposed as strings so a future MongoDB adapter can map Mongo `_id` to
the API `id` without leaking database-specific fields to clients.

- `User`: private email, student ID, optional phone, and role stay in the
  private model. Public profile responses only return `id`, `fullName`, and
  `avatarUrl`; they never return phone, email, or student ID.
- `Item`: references its owner through `ownerId`, rather than duplicating the
  owner profile. Status is `available`, `reserved`, or `exchanged`.
- `Appointment`: references the item and requester; date and time remain
  separate to match the current app contract.
- `ItemReport`: references the item and reporter and records reason/status.

### MongoDB collection/index proposal

This is a design proposal only; no MongoDB server or driver is configured.

| Collection | References and suggested indexes |
| --- | --- |
| `users` | Unique indexes on normalized `email` and `studentId`. Keep phone data private and expose it only through an authorized profile response. |
| `items` | `ownerId` reference; compound index `{ status: 1, category: 1, createdAt: -1 }` for browsing and `{ ownerId: 1, createdAt: -1 }` for a student's listings. |
| `appointments` | `itemId` and `requesterId` references; indexes `{ itemId: 1, status: 1 }` and `{ requesterId: 1, date: 1 }`. |
| `reports` | `itemId` and `reporterId` references; queue index `{ status: 1, createdAt: 1 }`. |

Store references rather than copying full user/item documents into appointments
or reports. Add a MongoDB text/Atlas Search index only after search requirements
and Vietnamese matching behavior are agreed.

The in-memory store is isolated behind `DemoStore`, which can later be replaced
by a MongoDB repository without changing the route response shapes. This demo
does not implement authentication or authorization. Never expose it as a
production API: callers can currently create or update sample data without a
real signed-in identity or role check.

## Endpoints

All responses use `{ "data": ... }`; errors use
`{ "error": { "code": "...", "message": "..." } }`.

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/health` | Check API and confirm in-memory demo mode |
| `GET` | `/users/:id/public` | Return a privacy-filtered public profile |
| `GET` | `/items?page=1&limit=10&query=&category=&status=` | List, search, filter, paginate |
| `GET` | `/items/:id` | Read one item |
| `POST` | `/items` | Create a sample item; validates fields and prohibited terms |
| `PATCH` | `/items/:id` | Update an item; validates fields and status transitions |
| `DELETE` | `/items/:id` | Delete an item |
| `GET` | `/appointments?page=1&limit=10&requesterId=` | List appointments |
| `POST` | `/appointments` | Create a pending appointment and reserve its item |
| `PATCH` | `/appointments/:id/status` | Confirm, cancel, or complete an appointment |
| `GET` | `/reports?page=1&limit=10` | List reports |
| `POST` | `/reports` | Create a pending report |
| `PATCH` | `/reports/:id/status` | Resolve a report as `actioned` or `dismissed` |

Appointment/report management routes are open demo endpoints. They are not
access-controlled until authentication and authorization are implemented.

## Example requests

```sh
curl "http://localhost:4000/api/v1/items?page=1&limit=5&status=available"
```

```sh
curl -X POST "http://localhost:4000/api/v1/items" \
  -H "Content-Type: application/json" \
  -d '{"ownerId":"user-001","title":"Giao trinh Java","description":"Sach con tot","category":"Giao trinh","condition":"good","imageUrl":""}'
```
