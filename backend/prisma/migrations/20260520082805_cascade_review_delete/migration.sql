-- DropForeignKey
ALTER TABLE "Activities" DROP CONSTRAINT "Activities_review_id_fkey";

-- DropForeignKey
ALTER TABLE "Notifications" DROP CONSTRAINT "Notifications_review_id_fkey";

-- DropForeignKey
ALTER TABLE "Reports" DROP CONSTRAINT "Reports_review_id_fkey";

-- DropForeignKey
ALTER TABLE "ReviewComments" DROP CONSTRAINT "ReviewComments_review_id_fkey";

-- AddForeignKey
ALTER TABLE "ReviewComments" ADD CONSTRAINT "ReviewComments_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "Reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activities" ADD CONSTRAINT "Activities_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "Reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reports" ADD CONSTRAINT "Reports_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "Reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notifications" ADD CONSTRAINT "Notifications_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "Reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;
