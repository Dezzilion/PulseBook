# Auth Service

Auth service for PulseBook.

## Endpoints

- `POST /auth/register` - register new user
- `POST /auth/login` - login with email/password
- `POST /auth/refresh` - refresh JWT access token
- `POST /auth/logout` - invalidate refresh token
- `GET /health` - health check

## Environment variables

- `PORT` - default `4000`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `JWT_ACCESS_EXPIRY` - default `15m`
- `JWT_REFRESH_EXPIRY` - default `7d`

## Run locally

```bash
cd backend/auth-service
npm install
npm start
```

## Docker

Build and start from the project root with:

```bash
docker compose up --build auth-service
```
