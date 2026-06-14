/*
  Warnings:

  - A unique constraint covering the columns `[provider,provider_id]` on the table `Users` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('LOCAL', 'GOOGLE', 'GITHUB', 'FACEBOOK');

-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "provider" "AuthProvider",
ADD COLUMN     "provider_id" TEXT,
ALTER COLUMN "password" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Users_provider_provider_id_key" ON "Users"("provider", "provider_id");
