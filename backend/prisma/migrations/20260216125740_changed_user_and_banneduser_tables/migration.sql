/*
  Warnings:

  - Added the required column `email` to the `BannedUsers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `BannedUsers` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "BannedUsers" DROP CONSTRAINT "BannedUsers_user_id_fkey";

-- AlterTable
ALTER TABLE "BannedUsers" ADD COLUMN     "email" VARCHAR(320) NOT NULL,
ADD COLUMN     "username" VARCHAR(25) NOT NULL;
