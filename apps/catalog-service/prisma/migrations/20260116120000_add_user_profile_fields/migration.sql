-- Add optional profile fields for users
ALTER TABLE "users"
ADD COLUMN "name" TEXT,
ADD COLUMN "phone" TEXT,
ADD COLUMN "company" TEXT;
