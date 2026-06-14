/*
  Warnings:

  - You are about to alter the column `rating` on the `Reviews` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to drop the `Activitys` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Activitys" DROP CONSTRAINT "Activitys_media_id_fkey";

-- DropForeignKey
ALTER TABLE "Activitys" DROP CONSTRAINT "Activitys_review_id_fkey";

-- DropForeignKey
ALTER TABLE "Activitys" DROP CONSTRAINT "Activitys_target_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Activitys" DROP CONSTRAINT "Activitys_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Conversations" DROP CONSTRAINT "Conversations_user1_id_fkey";

-- DropForeignKey
ALTER TABLE "Conversations" DROP CONSTRAINT "Conversations_user2_id_fkey";

-- DropForeignKey
ALTER TABLE "Follows" DROP CONSTRAINT "Follows_follow_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Follows" DROP CONSTRAINT "Follows_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Messages" DROP CONSTRAINT "Messages_sender_id_fkey";

-- DropForeignKey
ALTER TABLE "Notifications" DROP CONSTRAINT "Notifications_related_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Notifications" DROP CONSTRAINT "Notifications_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Playlists" DROP CONSTRAINT "Playlists_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Reports" DROP CONSTRAINT "Reports_profile_id_fkey";

-- DropForeignKey
ALTER TABLE "Reports" DROP CONSTRAINT "Reports_reporter_id_fkey";

-- DropForeignKey
ALTER TABLE "ReviewComments" DROP CONSTRAINT "ReviewComments_user_id_fkey";

-- DropForeignKey
ALTER TABLE "ReviewLikes" DROP CONSTRAINT "ReviewLikes_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Reviews" DROP CONSTRAINT "Reviews_user_id_fkey";

-- DropForeignKey
ALTER TABLE "UserMediaStatus" DROP CONSTRAINT "UserMediaStatus_user_id_fkey";

-- AlterTable
ALTER TABLE "Medias" ADD COLUMN     "rating" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Reviews" ALTER COLUMN "rating" SET DATA TYPE INTEGER;

-- DropTable
DROP TABLE "Activitys";

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "Users" (
    "id" TEXT NOT NULL,
    "username" VARCHAR(25) NOT NULL,
    "email" VARCHAR(320) NOT NULL,
    "password" TEXT NOT NULL,
    "favorite_band" TEXT NOT NULL,
    "profile_picture" BYTEA NOT NULL,
    "role" "Roles" NOT NULL DEFAULT 'BASIC',
    "has_notifications" BOOLEAN NOT NULL DEFAULT true,
    "phone_number" VARCHAR(15),
    "biography" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Activities" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "target_user_id" TEXT,
    "review_id" TEXT,
    "media_id" TEXT,
    "rating_from_user" INTEGER,
    "action" "ActivityActions" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Activities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_username_key" ON "Users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "Users"("email");

-- AddForeignKey
ALTER TABLE "Reviews" ADD CONSTRAINT "Reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewComments" ADD CONSTRAINT "ReviewComments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewLikes" ADD CONSTRAINT "ReviewLikes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Playlists" ADD CONSTRAINT "Playlists_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserMediaStatus" ADD CONSTRAINT "UserMediaStatus_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activities" ADD CONSTRAINT "Activities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activities" ADD CONSTRAINT "Activities_target_user_id_fkey" FOREIGN KEY ("target_user_id") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activities" ADD CONSTRAINT "Activities_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "Reviews"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activities" ADD CONSTRAINT "Activities_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "Medias"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follows" ADD CONSTRAINT "Follows_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follows" ADD CONSTRAINT "Follows_follow_user_id_fkey" FOREIGN KEY ("follow_user_id") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reports" ADD CONSTRAINT "Reports_reporter_id_fkey" FOREIGN KEY ("reporter_id") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reports" ADD CONSTRAINT "Reports_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notifications" ADD CONSTRAINT "Notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notifications" ADD CONSTRAINT "Notifications_related_user_id_fkey" FOREIGN KEY ("related_user_id") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversations" ADD CONSTRAINT "Conversations_user1_id_fkey" FOREIGN KEY ("user1_id") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversations" ADD CONSTRAINT "Conversations_user2_id_fkey" FOREIGN KEY ("user2_id") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Messages" ADD CONSTRAINT "Messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
