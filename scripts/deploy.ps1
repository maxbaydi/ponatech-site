# Скрипт обновления на VPS (ручной деплой)
# Использование: .\deploy.ps1

$SSH_HOST = "ponatech"
$DEPLOY_PATH = "/opt/app"

Write-Host "🔄 Обновление продакшена..." -ForegroundColor Cyan

ssh $SSH_HOST @"
set -e
cd $DEPLOY_PATH

echo "📥 Получение последних изменений..."
git fetch origin
git reset --hard origin/main
git clean -fd

echo "🛑 Останавливаем контейнеры..."
docker compose -f docker-compose.prod.yml down --remove-orphans

echo "🔨 Пересборка образов..."
docker compose -f docker-compose.prod.yml build

echo "🚀 Запуск..."
docker compose -f docker-compose.prod.yml up -d

sleep 10

echo "📊 Миграции..."
docker compose -f docker-compose.prod.yml exec -T catalog-service npx prisma migrate deploy || true

echo "✅ Статус:"
docker compose -f docker-compose.prod.yml ps
"@

Write-Host "`n✅ Деплой завершён!" -ForegroundColor Green
