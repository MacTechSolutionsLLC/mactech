-- AlterTable
ALTER TABLE "User" ADD COLUMN "isTemporaryPassword" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ADD COLUMN "temporaryPasswordExpiresAt" TIMESTAMP(3);
