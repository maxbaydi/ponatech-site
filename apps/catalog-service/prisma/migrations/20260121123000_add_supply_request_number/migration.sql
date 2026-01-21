CREATE SEQUENCE "supply_requests_sequenceNumber_seq";

ALTER TABLE "supply_requests" ADD COLUMN "sequenceNumber" INTEGER;
ALTER TABLE "supply_requests" ADD COLUMN "requestNumber" TEXT;

ALTER SEQUENCE "supply_requests_sequenceNumber_seq" OWNED BY "supply_requests"."sequenceNumber";

WITH ordered AS (
    SELECT "id", ROW_NUMBER() OVER (ORDER BY "createdAt", "id") AS seq
    FROM "supply_requests"
)
UPDATE "supply_requests" AS sr
SET "sequenceNumber" = ordered.seq
FROM ordered
WHERE sr."id" = ordered."id";

SELECT setval('"supply_requests_sequenceNumber_seq"', (SELECT COALESCE(MAX("sequenceNumber"), 0) FROM "supply_requests"));

ALTER TABLE "supply_requests" ALTER COLUMN "sequenceNumber" SET DEFAULT nextval('"supply_requests_sequenceNumber_seq"');
ALTER TABLE "supply_requests" ALTER COLUMN "sequenceNumber" SET NOT NULL;

UPDATE "supply_requests"
SET "requestNumber" = LPAD("sequenceNumber"::text, 4, '0') || '_' || TO_CHAR("createdAt", 'DDMMYYYY');

CREATE UNIQUE INDEX "supply_requests_requestNumber_key" ON "supply_requests"("requestNumber");
