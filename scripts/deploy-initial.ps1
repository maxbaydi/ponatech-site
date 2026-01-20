# Скрипт первичного развёртывания на VPS
# Использование: .\deploy-initial.ps1

param(
    [string]$RepoName = ""
)

$SSH_HOST = "ponatech"
$DEPLOY_PATH = "/opt/app"
$DOMAIN = "ponatech.ru"
$EMAIL = "admin@ponatech.ru"

if (-not $RepoName) {
    $RepoName = Read-Host "Введите репозиторий (формат: username/repo)"
}
$REPO_URL = "https://github.com/$RepoName.git"

Write-Host "🚀 Начинаем первичное развёртывание..." -ForegroundColor Cyan
Write-Host "   Репозиторий: $REPO_URL" -ForegroundColor Gray
Write-Host "   Домен: $DOMAIN" -ForegroundColor Gray

# 1. Подготовка сервера
Write-Host "`n📦 Шаг 1: Подготовка сервера..." -ForegroundColor Yellow
ssh $SSH_HOST @"
set -e

apt update && apt upgrade -y

apt install -y curl git

if ! command -v docker &> /dev/null; then
    echo "📦 Установка Docker..."
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
fi

docker --version
docker compose version

mkdir -p /opt/app

echo "✅ Сервер подготовлен"
"@

# 2. Клонирование репозитория
Write-Host "`n📥 Шаг 2: Клонирование репозитория..." -ForegroundColor Yellow
ssh $SSH_HOST @"
set -e
cd /opt
if [ -d "app/.git" ]; then
    echo "Обновление существующего репозитория..."
    cd app
    git fetch origin
    git reset --hard origin/main
else
    rm -rf app
    git clone $REPO_URL app
fi
cd /opt/app
echo "✅ Репозиторий готов"
"@

# 3. Создание .env файла
Write-Host "`n⚙️ Шаг 3: Настройка .env файла..." -ForegroundColor Yellow

$envExists = ssh $SSH_HOST "test -f /opt/.env.production && echo 'exists' || echo 'not_found'"

if ($envExists -eq "not_found") {
    Write-Host "⚠️ Файл .env.production не найден на сервере!" -ForegroundColor Red
    Write-Host "Создайте файл /opt/.env.production на сервере с переменными окружения." -ForegroundColor Yellow
    Write-Host "Пример: scp .env.production ponatech:/opt/.env.production" -ForegroundColor Gray
    Write-Host ""
    Read-Host "Нажмите Enter когда .env файл будет создан"
} else {
    Write-Host "✅ Файл .env.production найден" -ForegroundColor Green
}

# 4. Сборка образов
Write-Host "`n🔨 Шаг 4: Сборка Docker образов..." -ForegroundColor Yellow
ssh $SSH_HOST @"
set -e
cd /opt/app

cp /opt/.env.production .env

echo "Сборка образов (это может занять несколько минут)..."
docker compose -f docker-compose.prod.yml build --no-cache

echo "✅ Образы собраны"
"@

# 5. Получение SSL сертификата
Write-Host "`n🔐 Шаг 5: Получение SSL сертификата..." -ForegroundColor Yellow

$useStaging = Read-Host "Использовать тестовый сертификат (staging)? [y/N]"
$stagingArg = if ($useStaging -eq "y") { "1" } else { "0" }

ssh $SSH_HOST @"
set -e
cd /opt/app

chmod +x scripts/init-ssl.sh
bash scripts/init-ssl.sh $DOMAIN $EMAIL $stagingArg

echo "✅ SSL настроен"
"@

# 6. Запуск всех сервисов
Write-Host "`n🚀 Шаг 6: Запуск приложения..." -ForegroundColor Yellow
ssh $SSH_HOST @"
set -e
cd /opt/app

docker compose -f docker-compose.prod.yml up -d

echo "⏳ Ожидание запуска сервисов..."
sleep 20

echo "📊 Запуск миграций..."
docker compose -f docker-compose.prod.yml exec -T catalog-service npx prisma migrate deploy || true

echo ""
echo "📋 Статус контейнеров:"
docker compose -f docker-compose.prod.yml ps

echo "✅ Приложение запущено"
"@

Write-Host "`n✅ Первичное развёртывание завершено!" -ForegroundColor Green
Write-Host "🌐 Сайт доступен по адресу: https://$DOMAIN" -ForegroundColor Cyan
Write-Host ""
Write-Host "Следующие шаги:" -ForegroundColor Yellow
Write-Host "1. Настройте GitHub Secrets: .\scripts\setup-github-secrets.ps1" -ForegroundColor Gray
Write-Host "2. Push в main ветку запустит автоматический деплой" -ForegroundColor Gray
