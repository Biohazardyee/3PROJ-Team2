/*
  Warnings:

  - Made the column `has_notifications` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "has_notifications" SET NOT NULL;
