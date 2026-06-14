-- AlterTable
ALTER TABLE "ReviewComments" ADD COLUMN     "parent_id" TEXT;

-- AddForeignKey
ALTER TABLE "ReviewComments" ADD CONSTRAINT "ReviewComments_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "ReviewComments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
