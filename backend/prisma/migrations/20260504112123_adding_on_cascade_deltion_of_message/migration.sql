-- DropForeignKey
ALTER TABLE "Messages" DROP CONSTRAINT "Messages_conversation_id_fkey";

-- AddForeignKey
ALTER TABLE "Messages" ADD CONSTRAINT "Messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "Conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
