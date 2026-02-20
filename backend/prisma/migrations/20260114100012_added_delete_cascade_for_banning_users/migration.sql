-- DropForeignKey
ALTER TABLE "BannedUsers" DROP CONSTRAINT "BannedUsers_user_id_fkey";

-- AddForeignKey
ALTER TABLE "BannedUsers" ADD CONSTRAINT "BannedUsers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
