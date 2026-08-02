-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "email_verification_code" TEXT,
ADD COLUMN     "email_verification_expires" TIMESTAMP(3),
ADD COLUMN     "email_verified" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "twofa_enabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "twofa_secret" TEXT;
