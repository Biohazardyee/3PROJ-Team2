-- DropForeignKey
ALTER TABLE "PlaylistItems" DROP CONSTRAINT "PlaylistItems_playlist_id_fkey";

-- AddForeignKey
ALTER TABLE "PlaylistItems" ADD CONSTRAINT "PlaylistItems_playlist_id_fkey" FOREIGN KEY ("playlist_id") REFERENCES "Playlists"("id") ON DELETE CASCADE ON UPDATE CASCADE;
