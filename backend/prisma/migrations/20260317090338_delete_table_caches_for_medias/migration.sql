/*
  Warnings:

  - You are about to drop the `Caches` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `content` to the `Medias` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expires_at` to the `Medias` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Medias" ADD COLUMN     "content" JSONB NOT NULL,
ADD COLUMN     "expires_at" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "Caches";
