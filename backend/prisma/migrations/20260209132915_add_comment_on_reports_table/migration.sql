/*
  Warnings:

  - You are about to drop the `_ReportsToReviewComments` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_ReportsToReviewComments" DROP CONSTRAINT "_ReportsToReviewComments_A_fkey";

-- DropForeignKey
ALTER TABLE "_ReportsToReviewComments" DROP CONSTRAINT "_ReportsToReviewComments_B_fkey";

-- AlterTable
ALTER TABLE "Reports" ADD COLUMN     "comment_id" TEXT;

-- DropTable
DROP TABLE "_ReportsToReviewComments";

-- AddForeignKey
ALTER TABLE "Reports" ADD CONSTRAINT "Reports_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "ReviewComments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
