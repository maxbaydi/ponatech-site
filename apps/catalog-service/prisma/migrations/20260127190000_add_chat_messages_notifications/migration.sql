-- CreateEnum
DO $$
BEGIN
    CREATE TYPE "ChatMessageSender" AS ENUM ('CUSTOMER', 'MANAGER', 'SYSTEM');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- CreateEnum
DO $$
BEGIN
    CREATE TYPE "NotificationType" AS ENUM ('NEW_MESSAGE', 'STATUS_CHANGE', 'NEW_REQUEST');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "chat_messages" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "senderType" "ChatMessageSender" NOT NULL,
    "senderId" TEXT,
    "content" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "chat_message_attachments" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_message_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "email" TEXT,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "requestId" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "chat_messages_requestId_idx" ON "chat_messages"("requestId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "chat_messages_senderId_idx" ON "chat_messages"("senderId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "chat_messages_createdAt_idx" ON "chat_messages"("createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "chat_message_attachments_messageId_idx" ON "chat_message_attachments"("messageId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "notifications_userId_idx" ON "notifications"("userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "notifications_email_idx" ON "notifications"("email");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "notifications_requestId_idx" ON "notifications"("requestId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "notifications_isRead_idx" ON "notifications"("isRead");

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chat_messages_requestId_fkey'
    ) THEN
        ALTER TABLE "chat_messages"
            ADD CONSTRAINT "chat_messages_requestId_fkey"
            FOREIGN KEY ("requestId") REFERENCES "supply_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chat_messages_senderId_fkey'
    ) THEN
        ALTER TABLE "chat_messages"
            ADD CONSTRAINT "chat_messages_senderId_fkey"
            FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chat_message_attachments_messageId_fkey'
    ) THEN
        ALTER TABLE "chat_message_attachments"
            ADD CONSTRAINT "chat_message_attachments_messageId_fkey"
            FOREIGN KEY ("messageId") REFERENCES "chat_messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'notifications_userId_fkey'
    ) THEN
        ALTER TABLE "notifications"
            ADD CONSTRAINT "notifications_userId_fkey"
            FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'notifications_requestId_fkey'
    ) THEN
        ALTER TABLE "notifications"
            ADD CONSTRAINT "notifications_requestId_fkey"
            FOREIGN KEY ("requestId") REFERENCES "supply_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
