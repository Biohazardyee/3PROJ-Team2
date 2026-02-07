/*
  Warnings:

  - The `role` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `Activity` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Conversation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Follow` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Media` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Message` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Notification` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Playlist` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PlaylistItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Report` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Review` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ReviewComment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ReviewLike` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ReportToReviewComment` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Roles" AS ENUM ('BASIC', 'ADMIN');

-- CreateEnum
CREATE TYPE "ActivityActions" AS ENUM ('review_created', 'rating_added', 'playlist_added', 'follow');

-- CreateEnum
CREATE TYPE "ReportTypes" AS ENUM ('comment', 'profile', 'review');

-- CreateEnum
CREATE TYPE "NotificationActions" AS ENUM ('like_added', 'comment_added', 'new_follow', 'recommendation');

-- DropForeignKey
ALTER TABLE "Activity" DROP CONSTRAINT "Activity_media_id_fkey";

-- DropForeignKey
ALTER TABLE "Activity" DROP CONSTRAINT "Activity_review_id_fkey";

-- DropForeignKey
ALTER TABLE "Activity" DROP CONSTRAINT "Activity_target_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Activity" DROP CONSTRAINT "Activity_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Conversation" DROP CONSTRAINT "Conversation_user1_id_fkey";

-- DropForeignKey
ALTER TABLE "Conversation" DROP CONSTRAINT "Conversation_user2_id_fkey";

-- DropForeignKey
ALTER TABLE "Follow" DROP CONSTRAINT "Follow_follow_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Follow" DROP CONSTRAINT "Follow_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_conversation_id_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_sender_id_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_media_id_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_related_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_review_id_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Playlist" DROP CONSTRAINT "Playlist_user_id_fkey";

-- DropForeignKey
ALTER TABLE "PlaylistItem" DROP CONSTRAINT "PlaylistItem_media_id_fkey";

-- DropForeignKey
ALTER TABLE "PlaylistItem" DROP CONSTRAINT "PlaylistItem_playlist_id_fkey";

-- DropForeignKey
ALTER TABLE "Report" DROP CONSTRAINT "Report_reporter_id_fkey";

-- DropForeignKey
ALTER TABLE "Report" DROP CONSTRAINT "Report_review_id_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_media_id_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_user_id_fkey";

-- DropForeignKey
ALTER TABLE "ReviewComment" DROP CONSTRAINT "ReviewComment_review_id_fkey";

-- DropForeignKey
ALTER TABLE "ReviewComment" DROP CONSTRAINT "ReviewComment_user_id_fkey";

-- DropForeignKey
ALTER TABLE "ReviewLike" DROP CONSTRAINT "ReviewLike_review_id_fkey";

-- DropForeignKey
ALTER TABLE "ReviewLike" DROP CONSTRAINT "ReviewLike_user_id_fkey";

-- DropForeignKey
ALTER TABLE "UserMediaStatus" DROP CONSTRAINT "UserMediaStatus_media_id_fkey";

-- DropForeignKey
ALTER TABLE "_ReportToReviewComment" DROP CONSTRAINT "_ReportToReviewComment_A_fkey";

-- DropForeignKey
ALTER TABLE "_ReportToReviewComment" DROP CONSTRAINT "_ReportToReviewComment_B_fkey";

-- AlterTable
ALTER TABLE "BannedUsers" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "role",
ADD COLUMN     "role" "Roles" NOT NULL DEFAULT 'BASIC';

-- DropTable
DROP TABLE "Activity";

-- DropTable
DROP TABLE "Conversation";

-- DropTable
DROP TABLE "Follow";

-- DropTable
DROP TABLE "Media";

-- DropTable
DROP TABLE "Message";

-- DropTable
DROP TABLE "Notification";

-- DropTable
DROP TABLE "Playlist";

-- DropTable
DROP TABLE "PlaylistItem";

-- DropTable
DROP TABLE "Report";

-- DropTable
DROP TABLE "Review";

-- DropTable
DROP TABLE "ReviewComment";

-- DropTable
DROP TABLE "ReviewLike";

-- DropTable
DROP TABLE "_ReportToReviewComment";

-- DropEnum
DROP TYPE "ActivityAction";

-- DropEnum
DROP TYPE "NotificationAction";

-- DropEnum
DROP TYPE "ReportType";

-- DropEnum
DROP TYPE "Role";

-- CreateTable
CREATE TABLE "Medias" (
    "id" TEXT NOT NULL,
    "api_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Medias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reviews" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "media_id" TEXT NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL,
    "content" VARCHAR(1000) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewComments" (
    "id" TEXT NOT NULL,
    "review_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "content" VARCHAR(1000) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReviewComments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewLikes" (
    "user_id" TEXT NOT NULL,
    "review_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReviewLikes_pkey" PRIMARY KEY ("user_id","review_id")
);

-- CreateTable
CREATE TABLE "Playlists" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" VARCHAR(30) NOT NULL,
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Playlists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlaylistItems" (
    "id" TEXT NOT NULL,
    "playlist_id" TEXT NOT NULL,
    "media_id" TEXT NOT NULL,

    CONSTRAINT "PlaylistItems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Activitys" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "target_user_id" TEXT,
    "review_id" TEXT,
    "media_id" TEXT,
    "rating_from_user" INTEGER,
    "action" "ActivityActions" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Activitys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Follows" (
    "user_id" TEXT NOT NULL,
    "follow_user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Follows_pkey" PRIMARY KEY ("user_id","follow_user_id")
);

-- CreateTable
CREATE TABLE "Reports" (
    "id" TEXT NOT NULL,
    "reporter_id" TEXT NOT NULL,
    "review_id" TEXT,
    "reason" TEXT NOT NULL,
    "reason_type" "ReportTypes" NOT NULL,
    "is_checked" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "action" "NotificationActions" NOT NULL,
    "related_user_id" TEXT,
    "review_id" TEXT,
    "media_id" TEXT,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "read_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conversations" (
    "id" TEXT NOT NULL,
    "user1_id" TEXT NOT NULL,
    "user2_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Messages" (
    "id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "sender_id" TEXT NOT NULL,
    "content" VARCHAR(1000) NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ReportsToReviewComments" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ReportsToReviewComments_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Reviews_user_id_media_id_key" ON "Reviews"("user_id", "media_id");

-- CreateIndex
CREATE UNIQUE INDEX "Playlists_user_id_name_key" ON "Playlists"("user_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "PlaylistItems_playlist_id_media_id_key" ON "PlaylistItems"("playlist_id", "media_id");

-- CreateIndex
CREATE UNIQUE INDEX "Conversations_user1_id_user2_id_key" ON "Conversations"("user1_id", "user2_id");

-- CreateIndex
CREATE INDEX "_ReportsToReviewComments_B_index" ON "_ReportsToReviewComments"("B");

-- AddForeignKey
ALTER TABLE "Reviews" ADD CONSTRAINT "Reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reviews" ADD CONSTRAINT "Reviews_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "Medias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewComments" ADD CONSTRAINT "ReviewComments_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "Reviews"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewComments" ADD CONSTRAINT "ReviewComments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewLikes" ADD CONSTRAINT "ReviewLikes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewLikes" ADD CONSTRAINT "ReviewLikes_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "Reviews"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Playlists" ADD CONSTRAINT "Playlists_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaylistItems" ADD CONSTRAINT "PlaylistItems_playlist_id_fkey" FOREIGN KEY ("playlist_id") REFERENCES "Playlists"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaylistItems" ADD CONSTRAINT "PlaylistItems_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "Medias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserMediaStatus" ADD CONSTRAINT "UserMediaStatus_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "Medias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activitys" ADD CONSTRAINT "Activitys_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activitys" ADD CONSTRAINT "Activitys_target_user_id_fkey" FOREIGN KEY ("target_user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activitys" ADD CONSTRAINT "Activitys_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "Reviews"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activitys" ADD CONSTRAINT "Activitys_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "Medias"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follows" ADD CONSTRAINT "Follows_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follows" ADD CONSTRAINT "Follows_follow_user_id_fkey" FOREIGN KEY ("follow_user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reports" ADD CONSTRAINT "Reports_reporter_id_fkey" FOREIGN KEY ("reporter_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reports" ADD CONSTRAINT "Reports_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "Reviews"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notifications" ADD CONSTRAINT "Notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notifications" ADD CONSTRAINT "Notifications_related_user_id_fkey" FOREIGN KEY ("related_user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notifications" ADD CONSTRAINT "Notifications_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "Reviews"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notifications" ADD CONSTRAINT "Notifications_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "Medias"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversations" ADD CONSTRAINT "Conversations_user1_id_fkey" FOREIGN KEY ("user1_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversations" ADD CONSTRAINT "Conversations_user2_id_fkey" FOREIGN KEY ("user2_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Messages" ADD CONSTRAINT "Messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "Conversations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Messages" ADD CONSTRAINT "Messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ReportsToReviewComments" ADD CONSTRAINT "_ReportsToReviewComments_A_fkey" FOREIGN KEY ("A") REFERENCES "Reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ReportsToReviewComments" ADD CONSTRAINT "_ReportsToReviewComments_B_fkey" FOREIGN KEY ("B") REFERENCES "ReviewComments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
