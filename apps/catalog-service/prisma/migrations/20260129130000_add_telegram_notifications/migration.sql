-- Add telegram settings to users
ALTER TABLE "users"
ADD COLUMN IF NOT EXISTS "telegramChatId" TEXT;

ALTER TABLE "users"
ADD COLUMN IF NOT EXISTS "telegramNotificationsEnabled" BOOLEAN NOT NULL DEFAULT false;

-- Add telegram bot token to site settings
ALTER TABLE "site_settings"
ADD COLUMN IF NOT EXISTS "telegramBotToken" TEXT;
