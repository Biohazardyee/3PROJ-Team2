-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "password_reset_code" TEXT,
ADD COLUMN     "password_reset_expires" TIMESTAMP(3),
ADD COLUMN     "twofa_backup_codes" TEXT[] DEFAULT ARRAY[]::TEXT[];
