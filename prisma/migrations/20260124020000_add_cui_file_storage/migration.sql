-- CreateTable
CREATE TABLE "StoredCUIFile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "data" BYTEA NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),
    "signedUrlExpiresAt" TIMESTAMP(3),
    "metadata" TEXT,

    CONSTRAINT "StoredCUIFile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StoredCUIFile_userId_idx" ON "StoredCUIFile"("userId");

-- CreateIndex
CREATE INDEX "StoredCUIFile_uploadedAt_idx" ON "StoredCUIFile"("uploadedAt");

-- CreateIndex
CREATE INDEX "StoredCUIFile_deletedAt_idx" ON "StoredCUIFile"("deletedAt");

-- AddForeignKey
ALTER TABLE "StoredCUIFile" ADD CONSTRAINT "StoredCUIFile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
