#!/bin/bash
set -e

DOMAIN=${1:-ponatech.ru}
EMAIL=${2:-admin@$DOMAIN}
STAGING=${3:-0}

echo "🔐 Получение SSL сертификата для $DOMAIN..."

cd /opt/app

if [ "$STAGING" = "1" ]; then
  STAGING_ARG="--staging"
  echo "⚠️ Используется staging режим (тестовый сертификат)"
else
  STAGING_ARG=""
fi

# Сохраняем основной конфиг
cp nginx/nginx.conf nginx/nginx.ssl.conf.bak

# Запускаем nginx с начальной конфигурацией (без SSL)
echo "📦 Запуск nginx с начальной конфигурацией..."
cp nginx/nginx.initial.conf nginx/nginx.conf
docker compose -f docker-compose.prod.yml up -d nginx

echo "⏳ Ожидание запуска nginx..."
sleep 10

# Получаем сертификат через webroot
echo "🔐 Запрос сертификата Let's Encrypt..."
docker compose -f docker-compose.prod.yml run --rm certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  -d $DOMAIN \
  -d www.$DOMAIN \
  --email $EMAIL \
  --agree-tos \
  --no-eff-email \
  --force-renewal \
  $STAGING_ARG

# Восстанавливаем SSL конфигурацию
echo "⚙️ Применение SSL конфигурации..."
cp nginx/nginx.ssl.conf.bak nginx/nginx.conf
rm nginx/nginx.ssl.conf.bak

# Перезапускаем nginx с SSL
echo "🔄 Перезапуск nginx с SSL..."
docker compose -f docker-compose.prod.yml restart nginx

echo ""
echo "✅ SSL сертификат получен и nginx сконфигурирован!"
echo "📋 Сертификат действителен 90 дней, certbot автоматически обновит его."
