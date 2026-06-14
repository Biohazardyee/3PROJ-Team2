-- CreateTable
CREATE TABLE "CommentLikes" (
    "user_id" TEXT NOT NULL,
    "comment_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommentLikes_pkey" PRIMARY KEY ("user_id","comment_id")
);

-- AddForeignKey
ALTER TABLE "CommentLikes" ADD CONSTRAINT "CommentLikes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentLikes" ADD CONSTRAINT "CommentLikes_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "ReviewComments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
