CREATE TABLE "supply_request_attachments" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "supply_request_attachments_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "supply_request_attachments_requestId_idx" ON "supply_request_attachments"("requestId");

ALTER TABLE "supply_request_attachments" ADD CONSTRAINT "supply_request_attachments_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "supply_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
