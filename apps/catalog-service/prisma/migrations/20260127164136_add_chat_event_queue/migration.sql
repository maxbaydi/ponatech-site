-- CreateEnum
CREATE TYPE "ChatEventType" AS ENUM ('NEW_MESSAGE', 'MESSAGE_READ', 'NOTIFICATION');

-- CreateTable
CREATE TABLE "chat_event_queue" (
    "id" SERIAL NOT NULL,
    "type" "ChatEventType" NOT NULL,
    "requestId" TEXT,
    "userId" TEXT,
    "email" TEXT,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_event_queue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "chat_event_queue_requestId_idx" ON "chat_event_queue"("requestId");

-- CreateIndex
CREATE INDEX "chat_event_queue_userId_idx" ON "chat_event_queue"("userId");

-- CreateIndex
CREATE INDEX "chat_event_queue_email_idx" ON "chat_event_queue"("email");

-- CreateIndex
CREATE INDEX "chat_event_queue_createdAt_idx" ON "chat_event_queue"("createdAt");
