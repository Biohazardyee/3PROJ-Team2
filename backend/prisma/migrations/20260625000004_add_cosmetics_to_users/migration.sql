-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "owned_cosmetics" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "equipped_avatar_border" TEXT;
