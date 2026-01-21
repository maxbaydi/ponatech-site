CREATE TYPE "SupplyRequestStatus" AS ENUM ('NEW', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

ALTER TABLE "supply_requests" ADD COLUMN "status" "SupplyRequestStatus" NOT NULL DEFAULT 'NEW';
