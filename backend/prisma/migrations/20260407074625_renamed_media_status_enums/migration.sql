/*
  Warnings:

  - The values [planned,listening,completed,abandoned] on the enum `MediaStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "MediaStatus_new" AS ENUM ('listened', 'later', 'favorite', 'disliked');
ALTER TABLE "UserMediaStatus" ALTER COLUMN "status" TYPE "MediaStatus_new" USING ("status"::text::"MediaStatus_new");
ALTER TYPE "MediaStatus" RENAME TO "MediaStatus_old";
ALTER TYPE "MediaStatus_new" RENAME TO "MediaStatus";
DROP TYPE "public"."MediaStatus_old";
COMMIT;
