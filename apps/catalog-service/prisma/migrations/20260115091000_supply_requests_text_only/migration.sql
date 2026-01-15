-- AlterTable
ALTER TABLE "supply_requests"
  DROP COLUMN "productName",
  DROP COLUMN "quantity",
  ALTER COLUMN "description" SET NOT NULL;

