/*
  Warnings:

  - You are about to drop the column `password_hash` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[user_id,media_id]` on the table `Review` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "password_hash",
ADD COLUMN     "password" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Review_user_id_media_id_key" ON "Review"("user_id", "media_id");
