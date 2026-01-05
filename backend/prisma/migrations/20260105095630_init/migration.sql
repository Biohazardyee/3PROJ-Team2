/*
  Warnings:

  - You are about to drop the column `music_id` on the `Activity` table. All the data in the column will be lost.
  - You are about to drop the column `music_id` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `music_id` on the `PlaylistItem` table. All the data in the column will be lost.
  - You are about to drop the column `music_id` on the `Review` table. All the data in the column will be lost.
  - The primary key for the `UserMusicStatus` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `music_id` on the `UserMusicStatus` table. All the data in the column will be lost.
  - You are about to drop the `Music` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[playlist_id,media_id]` on the table `PlaylistItem` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `media_id` to the `PlaylistItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `media_id` to the `Review` table without a default value. This is not possible if the table is not empty.
  - Added the required column `media_id` to the `UserMusicStatus` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Activity" DROP CONSTRAINT "Activity_music_id_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_music_id_fkey";

-- DropForeignKey
ALTER TABLE "PlaylistItem" DROP CONSTRAINT "PlaylistItem_music_id_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_music_id_fkey";

-- DropForeignKey
ALTER TABLE "UserMusicStatus" DROP CONSTRAINT "UserMusicStatus_music_id_fkey";

-- DropIndex
DROP INDEX "PlaylistItem_playlist_id_music_id_key";

-- AlterTable
ALTER TABLE "Activity" DROP COLUMN "music_id",
ADD COLUMN     "media_id" TEXT;

-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "music_id",
ADD COLUMN     "media_id" TEXT;

-- AlterTable
ALTER TABLE "PlaylistItem" DROP COLUMN "music_id",
ADD COLUMN     "media_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Review" DROP COLUMN "music_id",
ADD COLUMN     "media_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "UserMusicStatus" DROP CONSTRAINT "UserMusicStatus_pkey",
DROP COLUMN "music_id",
ADD COLUMN     "media_id" TEXT NOT NULL,
ADD CONSTRAINT "UserMusicStatus_pkey" PRIMARY KEY ("user_id", "media_id");

-- DropTable
DROP TABLE "Music";

-- CreateTable
CREATE TABLE "Media" (
    "id" TEXT NOT NULL,
    "api_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PlaylistItem_playlist_id_media_id_key" ON "PlaylistItem"("playlist_id", "media_id");

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "Media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaylistItem" ADD CONSTRAINT "PlaylistItem_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "Media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserMusicStatus" ADD CONSTRAINT "UserMusicStatus_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "Media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;
