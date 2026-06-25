-- Backfill: les comptes existants sans pseudo reprennent leur username
UPDATE "Users" SET "pseudo" = "username" WHERE "pseudo" IS NULL;

-- AlterTable: le pseudo devient obligatoire
ALTER TABLE "Users" ALTER COLUMN "pseudo" SET NOT NULL;
