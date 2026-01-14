# commands

`/grpc-update` — обнови TS-интерфейсы из .proto файлов.

`/scaffold-service [name]` — создай структуру нового микросервиса с Dockerfile и базовым конфигом.

`/audit` — проверь код на наличие `any`, отсутствующих DTO или хардкода.

`/sanity` — Запусти полный цикл проверки: 1) Generate Prisma Client, 2) Generate Proto Types, 3) Build Service, 4) Run Tests. Исправь все ошибки, которые найдешь.

`/fc [name]` — (Frontend Component) Создай новый функциональный компонент в `front/src/components`. Используй shadcn.

`/page [route]` — Создай новую страницу (`page.tsx`) в `front/src/app`.

`/shadcn-add [component]` — Инструкция добавить компонент (например: `npx shadcn@latest add button`).
