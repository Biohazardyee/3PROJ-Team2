-- AlterTable
ALTER TABLE "Reports" ADD COLUMN     "profile_id" TEXT;

-- AddForeignKey
ALTER TABLE "Reports" ADD CONSTRAINT "Reports_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
