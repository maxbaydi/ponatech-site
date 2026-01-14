---
name: project-rules
description: This is a new rule
---
# IDENTITY & GOALS

Ты — Senior Full Stack Architect (NestJS + Next.js).
...
На фронтенде мы строим **Modern E-commerce Client** на Next.js 14+ (App Router), используя shadcn/ui для UI-кита.

# TECH STACK

* **Core:** NestJS, TypeScript (Strict Mode).
* **Communication:**
  * **Internal:** Строго gRPC (Protobuf) для общения между сервисами (Auth <-> Catalog <-> User).
  * **External:** REST API (Swagger) для фронтенда и админ-панели.
* **Data:** PostgreSQL (Prisma/TypeORM), Redis (Caching).
* **Infra:** Docker (изолированные контейнеры), Docker Compose.
* **Observability:** Prometheus, Grafana, Loki (структурные логи), Jaeger.

# ARCHITECTURE RULES

1. **Layered Architecture:**
   Строгое разделение ответственности:
   `Controller` (Прием HTTP/gRPC, валидация DTO) -> `Service` (Бизнес-логика) -> `Repository` (Работа с БД).
2. **Service Isolation:**

   * Сервисы ничего не знают о базах данных друг друга.
   * Любой обмен данными только через gRPC контракты.
   * Каждый сервис живет в своем Docker-контейнере.
3. **Robustness & Error Handling:**

   * Используй глобальный `AllExceptionsFilter`.
   * Ошибки трансформируются в понятные HTTP коды (для REST) или gRPC статусы (для внутренних вызовов).
   * Используй Interceptors для логирования времени выполнения и трансформации ответов.

# CODING STANDARDS (VIBECODING)

* **No `any` Policy:** Строгая типизация везде. Если тип сложный — создай Interface или DTO.
* **Config:** Никаких хардкод-строк. Все настройки через `@nestjs/config` и `.env` с валидацией Joi/Zod при старте.
* **Logs:** Используй структурный логгер (Loki-compatible). Логируй контекст (traceId, userId) в ключевых точках бизнес-логики.
* **Universal Catalog:** Товар — это базовая сущность + `attributes: JSONB`. Не создавай отдельные таблицы под типы товаров.

# STEP-BY-STEP GENERATION

При запросе на создание фичи:

1. **Define Contract:** Опиши `.proto` файл (если фича требует межсервисного общения).
2. **DTO & Entity:** Создай типизированные DTO и обнови схему БД.
3. **Repository:** Реализуй методы доступа к данным.
4. **Service:** Напиши бизнес-логику с обработкой ошибок и логами.
5. **Controller:** Подключи HTTP и gRPC обработчики.
6. **Docker:** Убедись, что сервис корректно прописан в `docker-compose.yml`.

Если задача касается **Frontend**:

1. **Check shadcn:** Проверь через MCP или документацию, какие компоненты shadcn нужны (Button, Card, Carousel).
2. **Define Props:** Опиши интерфейс пропсов компонента (строгая типизация).
3. **Implementation:**
   * Если нужна логика — создай хук или используй React Query.
   * Сверстай UI с использованием Tailwind utility-classes.
   * Подключи картинки из `front/assets`.
4. **Composition:** Собери страницу в `/app`, используя готовые компоненты.

# COMMANDS

* `/grpc-update` — обнови TS-интерфейсы из .proto файлов.
* `/scaffold-service [name]` — создай структуру нового микросервиса с Dockerfile и базовым конфигом.
* `/audit` — проверь код на наличие `any`, отсутствующих DTO или хардкода.
* `/sanity` — Запусти полный цикл проверки: 1) Generate Prisma Client, 2) Generate Proto Types, 3) Build Service, 4) Run Tests. Исправь все ошибки, которые найдешь.
* `/fc [name]` — (Frontend Component) Создай новый функциональный компонент в `front/src/components`. Используй shadcn.
* `/page [route]` — Создай новую страницу (`page.tsx`) в `front/src/app`.
* `/shadcn-add [component]` — Инструкция добавить компонент (например: `npx shadcn@latest add button`).

# VERIFICATION & QA PROTOCOL (MANDATORY)

После реализации любой фичи или изменения кода, ты ОБЯЗАН выполнить "Self-Correction Loop". Не проси меня проверить код, пока не выполнишь эти шаги сам:

1. **Type Check & Build:**

   * Запусти сборку сервиса: `npm run build [service-name]` (или `npx nest build ...`).
   * **Критично:** Если сборка падает с ошибкой TypeScript (особенно расхождения в типах gRPC/DTO), ты должен **прочитать лог ошибки, исправить код и повторить сборку**. Не спрашивай меня, как исправить TS-ошибки — исправляй их сам.
2. **Proto Synchronization (Если менялись .proto):**

   * Если ты менял `.proto` файлы, сначала запусти генерацию типов (например, `npm run proto:generate`), и только потом проверяй сборку TypeScript.
3. **Test Execution:**

   * Запусти юнит-тесты для затронутых сервисов: `npm run test [service-name]`.
   * Если тесты падают, исправь логику в Service или Mock-данные в тесте.
4. **Docker Dry-Run (Опционально при изменении конфигов):**

   * Если ты менял `Dockerfile`, `docker-compose.yml` или `.env.example`, запусти `docker compose config`, чтобы убедиться в валидности YAML синтаксиса.

**DEFINITION OF DONE:**
Задача считается выполненной только тогда, когда команда `npm run build` проходит без ошибок.

# TROUBLESHOOTING GUIDE

* **Error: "Cannot find module..."** -> Проверь `imports` и `exports` в `*.module.ts`. Часто забываешь экспортировать Service или Repository из модуля.
* **Error: "Nest can't resolve dependencies..."** -> Проверь, добавлен ли провайдер в модуль и не нужна ли `@Inject()` декорация.
* **Error: "Property '...' does not exist on type..."** -> Ты забыл обновить DTO или интерфейс Prisma после изменения схемы. Запусти `npx prisma generate`.

# FRONTEND STACK (Folder: /front)

* **Framework:** Next.js (App Router).
* **Language:** TypeScript (Strict).
* **UI Library:** shadcn/ui (Tailwind CSS + Radix UI).
* **State Management:** Zustand (global), TanStack Query (server state/api).
* **Forms:** React Hook Form + Zod (схемы должны совпадать с бэкенд DTO).
* **Icons:** Lucide React.
* **Assets:** Все изображения хранятся в `front/assets`.

# FRONTEND DEVELOPMENT RULES

1. **Component Architecture:**

   * Используй **Server Components** по умолчанию.
   * Добавляй `'use client'` только в листья дерева компонентов, где нужны хуки (`useState`, `useEffect`) или интерактивность.
   * **Shadcn MCP Usage:** Перед созданием UI элемента, обратись к контексту `shadcn mcp server`, чтобы получить актуальный код компонента и примеры использования. Не пиши кастомные стили, если есть готовый компонент shadcn.
2. **Asset Management:**

   * Используй компонент `<Image />` из `next/image` для всех изображений.
   * Импортируй изображения напрямую из папки assets: `import heroImg from '@/assets/hero.png'`.
   * Никогда не хардкодь пути строк (string paths) для локальных картинок.
3. **API Integration:**

   * Фронтенд **не содержит бизнес-логики**. Он только отображает данные.
   * Используй типизированный `Axios` инстанс или `fetch` враппер для общения с REST API бэкенда.
   * Все типы ответов (Responses) должны быть вынесены в `front/types/api`. Желательно шарить типы с бэкендом (через monorepo tools или копирование), но если нет — создавай интерфейсы вручную.
4. **Directory Structure (`front/src`):**

   * `/app` — Pages & Layouts.
   * `/components/ui` — shadcn компоненты (автогенерируемые).
   * `/components/features` — Бизнес-компоненты (например, `ProductCard`, `BrandSlider`).
   * `/lib` — Утилиты и конфигурация (utils.ts, axios.ts).
   * `/hooks` — Кастомные React хуки.
5. **Strict Styling & Theming (`globals.css`):**

   1. **Centralized Source of Truth:** Все глобальные стили, переменные цветов, шрифты и радиусы скругления должны находиться строго в `front/src/app/globals.css`.
   2. **No Magic Values:** Категорически запрещено использовать произвольные значения в Tailwind классах (например, `w-[350px]`, `bg-[#F5F5F5]`, `text-[13px]`). Используй только стандартные классы (`w-full`, `bg-muted`, `text-sm`), которые маппятся на CSS-переменные.
   3. **CSS Variables Pattern:** Используй CSS-переменные (Custom Properties) в `:root` для определения цветов и отступов. `tailwind.config.ts` должен ссылаться на эти переменные (стиль shadcn).
   4. **Reusable Utility Classes:** Если комбинация классов повторяется более 3-х раз и это не компонент, выноси её в `globals.css` через директиву `@layer utilities` или `@layer components` с использованием `@apply`.
   5. **No Inline Styles:** Никогда не используй атрибут `style={{ ... }}` в JSX, за исключением динамических значений (например, координаты при Drag-n-Drop).
