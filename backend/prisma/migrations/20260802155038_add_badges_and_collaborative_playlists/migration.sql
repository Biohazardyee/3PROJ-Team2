-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationActions" ADD VALUE 'badge_earned';
ALTER TYPE "NotificationActions" ADD VALUE 'playlist_collaborator_added';

-- AlterTable
ALTER TABLE "Playlists" ADD COLUMN     "is_collaborative" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "earned_badges" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateTable
CREATE TABLE "PlaylistCollaborators" (
    "playlist_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlaylistCollaborators_pkey" PRIMARY KEY ("playlist_id","user_id")
);

-- AddForeignKey
ALTER TABLE "PlaylistCollaborators" ADD CONSTRAINT "PlaylistCollaborators_playlist_id_fkey" FOREIGN KEY ("playlist_id") REFERENCES "Playlists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaylistCollaborators" ADD CONSTRAINT "PlaylistCollaborators_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
