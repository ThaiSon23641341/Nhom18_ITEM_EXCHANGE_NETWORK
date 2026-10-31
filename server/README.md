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
- `GET /reports`, `POST /reports`, `PATCH /reports/:id`

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
