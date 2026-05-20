-- DropForeignKey
ALTER TABLE "ReviewLikes" DROP CONSTRAINT "ReviewLikes_review_id_fkey";

-- AddForeignKey
ALTER TABLE "ReviewLikes" ADD CONSTRAINT "ReviewLikes_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "Reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;
