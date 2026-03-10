-- AlterTable
ALTER TABLE "Users" ALTER COLUMN "favorite_band" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Caches" (
    "id" TEXT NOT NULL,
    "api_id" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Caches_pkey" PRIMARY KEY ("id")
);
