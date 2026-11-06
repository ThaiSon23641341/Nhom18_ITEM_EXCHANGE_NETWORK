# JSON Server demo API

This folder contains a local JSON Server instance and fake seed data for app
integration tests. It is not an authentication provider and must not be exposed
to the public internet or used with real student data.

## Run

From the repository root:

```sh
npm --prefix server install
npm --prefix server start
```

The API listens on port `3001` by default. Override `PORT` or `HOST` as needed.
Because the default host listens on the local network for device testing, only
run it on a trusted network and use fake data.

API endpoints are ordinary JSON Server resources:

- `GET /health`
- `GET /items`, `GET /items/:id`, `POST /items`, `PATCH /items/:id`, `DELETE /items/:id`
- `GET /users?email=...`, `POST /users`, `GET /users/:id/public`
- `POST /auth/login`, `POST /auth/register`, `POST /auth/forgot-password`, `POST /auth/reset-password`
  (passwords are stored as salted scrypt hashes in `credentials`, which is never served;
  seeded accounts accept the demo password `Demo@1234` until they set their own;
  the reset code is returned in the response because the demo sends no email)
  Login and register return `{ token, user }`; the token (30 days) is sent as `Authorization: Bearer <token>`.
  Only a SHA-256 hash is kept in `sessions`, which is never served. A password reset revokes all sessions.
- `GET /auth/session` restores the signed-in user; `DELETE /auth/session` signs out.
- `PATCH /users/:id` (own profile only): `faculty`, `className`, `avatarUrl`; any other field is rejected.
  `GET /users/:id/public` adds `faculty`, `className`, `successfulExchanges` and `reputation`.
- `POST /uploads` (signed in): raw `image/jpeg` or `image/png` body, max 5 MB, type checked by file signature,
  stored in `server/uploads/` (git-ignored) under a random name; returns `{ url: '/uploads/<name>' }`.
  `lib/uploads.cjs` has `removeOrphanUploads` to delete unreferenced files.
- `GET /reports`, `POST /reports`, `PATCH /reports/:id`

## Route files and owners

`server.cjs` only creates the server and registers the files in `routes/`. Each
route file exports `register({ app, router })` and has one owner (see
`root/PHASE4_ASSIGNMENT.md`). Shared helpers live in `lib/helpers.cjs`.

| File | Owner | Endpoints |
| --- | --- | --- |
| `routes/users.cjs` | Sơn | `GET /health`, `POST /users`, `GET /users/:id/public` |
| `routes/items.cjs` | Phú | `POST /items`, `PATCH /items/:id` validation |
| `routes/reports.cjs` | Phú | `POST /reports`, `PATCH /reports/:id` validation |
| `routes/appointments.cjs` | Tú | `/appointments` (to be added) |
| `routes/favorites.cjs` | Phúc | `/favorites` (to be added) |
| `routes/uploads.cjs` | Sơn | `POST /uploads`, static `/uploads` |
| `routes/messages.cjs` | Tú | `/appointments/:id/messages` (empty placeholder) |

Tests follow the same split in `test/<feature>.test.cjs`; reuse
`test/helpers.cjs`. Only Sơn edits `db.json`, `package*.json` and `server.cjs`.

The server validates demo item/report writes, disallows prohibited listing
terms and limits public profile fields. JSON Server does not enforce
authentication, authorization, or ownership. App-side login merely selects or
creates a fake student profile; it does not verify control of the email address.

`db.json` is the development database. Writes persist there; restore the seed
file from Git to reset demo data. Do not put personal information or credentials
in it.

## App API URL

The app defaults to `http://localhost:3001`. Copy the root `.env.example` to
`.env.local` to override `EXPO_PUBLIC_API_URL`.

- Android emulator: `http://10.0.2.2:3001`
- iOS simulator or web on the same computer: `http://localhost:3001`
- Physical device: `http://<computer-LAN-IP>:3001` and allow the port on the
  local firewall.

## Tests

```sh
npm --prefix server test
```
