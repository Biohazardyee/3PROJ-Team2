/*
  Warnings:

  - The primary key for the `Activity` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the `UserMusicStatus` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "MediaStatus" AS ENUM ('planned', 'listening', 'completed', 'abandoned');

-- DropForeignKey
ALTER TABLE "UserMusicStatus" DROP CONSTRAINT "UserMusicStatus_media_id_fkey";

-- DropForeignKey
ALTER TABLE "UserMusicStatus" DROP CONSTRAINT "UserMusicStatus_user_id_fkey";

-- AlterTable
ALTER TABLE "Activity" DROP CONSTRAINT "Activity_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Activity_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Activity_id_seq";

-- DropTable
DROP TABLE "UserMusicStatus";

-- DropEnum
DROP TYPE "MusicStatus";

-- CreateTable
CREATE TABLE "UserMediaStatus" (
    "user_id" TEXT NOT NULL,
    "media_id" TEXT NOT NULL,
    "status" "MediaStatus" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserMediaStatus_pkey" PRIMARY KEY ("user_id","media_id")
);

-- AddForeignKey
ALTER TABLE "UserMediaStatus" ADD CONSTRAINT "UserMediaStatus_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserMediaStatus" ADD CONSTRAINT "UserMediaStatus_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "Media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
