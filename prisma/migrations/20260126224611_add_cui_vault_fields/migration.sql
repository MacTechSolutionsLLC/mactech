-- AlterTable
ALTER TABLE "StoredCUIFile" ADD COLUMN "storedInVault" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "StoredCUIFile" ADD COLUMN "vaultId" TEXT;

-- CreateIndex
CREATE INDEX "StoredCUIFile_storedInVault_idx" ON "StoredCUIFile"("storedInVault");

-- CreateIndex
CREATE INDEX "StoredCUIFile_vaultId_idx" ON "StoredCUIFile"("vaultId");
