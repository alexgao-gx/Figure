# POC 2: NestJS + PostgreSQL + Keycloak

This proof of concept demonstrates integrating NestJS with a PostgreSQL
backend secured by Keycloak. Two roles are used: **admin** and
**supplier**. API routes are protected using `nestjs-keycloak-connect`.

## Structure

```
poc2/
  server/  - NestJS backend
```

- `admin` and `supplier` modules expose separate routes
- `user` module uses TypeORM for a simple user table

## Running

1. Install dependencies:
   ```bash
   cd poc2/server
   npm install
   ```
2. Configure Keycloak and PostgreSQL connection in `src/app.module.ts`.
3. Start the NestJS server:
   ```bash
   npm start
   ```
   The server listens on `http://localhost:3002`.

This POC can be combined with the existing realtime dashboard by
forwarding authenticated requests from the front‑end to the NestJS
server.
