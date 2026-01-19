# PONA TECH

Веб-платформа для B2B-поставок промышленного и ИТ-оборудования.

## Стек технологий

- **Frontend:** Next.js, React, Tailwind CSS, shadcn/ui
- **Backend:** NestJS (микросервисы: auth-service, catalog-service)
- **База данных:** PostgreSQL, Prisma ORM
- **Хранилище:** MinIO
- **Коммуникация:** gRPC
- **Контейнеризация:** Docker

## Структура проекта

```
├── apps/
│   ├── auth-service/      # Сервис аутентификации
│   └── catalog-service/   # Сервис каталога товаров
├── front/                 # Next.js фронтенд
├── libs/common/           # Общие модули
└── proto/                 # gRPC протоколы
```

## Запуск

```bash
# Установка зависимостей
npm install
cd front && npm install

# Запуск инфраструктуры
docker-compose up -d

# Миграции БД
npx prisma migrate deploy --schema=apps/catalog-service/prisma/schema.prisma

# Запуск сервисов
npm run start:dev auth-service
npm run start:dev catalog-service

# Запуск фронтенда
cd front && npm run dev
```

## Переменные окружения

Скопируйте `.env.example` в `.env` и заполните необходимые значения.
