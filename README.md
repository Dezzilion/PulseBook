# PulseBook

Проєкт PulseBook — інтелектуальна система бронювання місць на культурні та спортивні заходи.

## Структура проєкту

- `frontend/` — Next.js клієнтська частина
- `backend/` — NestJS мікросервіси
  - `auth-service/` — автентифікація та профіль
  - `event-service/` — управління подіями
  - `booking-service/` — бронювання місць
  - `payment-service/` — оплата та квитки
  - `analytics-service/` — аналітика
- `ai/` — Python мікросервіс рекомендацій
- `data/` — база даних, міграції, схеми
- `infra/` — Docker, Kubernetes, інфраструктурні налаштування
- `docs/` — документація, архітектурні діаграми

## Технології

- Frontend: Next.js 15 (App Router), TypeScript, Tailwind CSS, Shadcn/ui, Zustand, TanStack Query
- Backend: NestJS, TypeScript, PostgreSQL, Prisma ORM, Redis, JWT + Refresh tokens
- AI: Python, FastAPI, scikit-learn, TensorFlow/PyTorch, гібридна рекомендаційна система
- Інфраструктура: Docker, Docker Compose, Kubernetes, Vercel, Railway/Render
