/*
  Warnings:

  - You are about to alter the column `content` on the `Message` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(1000)`.
  - Made the column `role` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `profile_picture` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Message" ALTER COLUMN "content" SET DATA TYPE VARCHAR(1000);

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "role" SET NOT NULL,
ALTER COLUMN "profile_picture" SET NOT NULL;
