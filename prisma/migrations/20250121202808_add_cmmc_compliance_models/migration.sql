-- AlterTable: Add fields to User model
ALTER TABLE "User" ADD COLUMN "lastLoginAt" TIMESTAMP(3),
ADD COLUMN "disabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "securityAcknowledgmentVersion" TEXT,
ADD COLUMN "securityAcknowledgmentAcceptedAt" TIMESTAMP(3),
ADD COLUMN "securityAcknowledgmentRequired" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX "User_disabled_idx" ON "User"("disabled");
CREATE INDEX "User_lastLoginAt_idx" ON "User"("lastLoginAt");

-- CreateTable: AppEvent
CREATE TABLE "AppEvent" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actorUserId" TEXT,
    "actorEmail" TEXT,
    "actionType" TEXT NOT NULL,
    "targetType" TEXT,
    "targetId" TEXT,
    "ip" TEXT,
    "userAgent" TEXT,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "details" TEXT,

    CONSTRAINT "AppEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AppEvent_timestamp_idx" ON "AppEvent"("timestamp");
CREATE INDEX "AppEvent_actorUserId_idx" ON "AppEvent"("actorUserId");
CREATE INDEX "AppEvent_actionType_idx" ON "AppEvent"("actionType");
CREATE INDEX "AppEvent_targetType_targetId_idx" ON "AppEvent"("targetType", "targetId");
CREATE INDEX "AppEvent_success_idx" ON "AppEvent"("success");

-- AddForeignKey
ALTER TABLE "AppEvent" ADD CONSTRAINT "AppEvent_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable: StoredFile
CREATE TABLE "StoredFile" (
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

    CONSTRAINT "StoredFile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StoredFile_userId_idx" ON "StoredFile"("userId");
CREATE INDEX "StoredFile_uploadedAt_idx" ON "StoredFile"("uploadedAt");
CREATE INDEX "StoredFile_deletedAt_idx" ON "StoredFile"("deletedAt");

-- AddForeignKey
ALTER TABLE "StoredFile" ADD CONSTRAINT "StoredFile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: PublicContent
CREATE TABLE "PublicContent" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PublicContent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PublicContent_isPublic_idx" ON "PublicContent"("isPublic");
CREATE INDEX "PublicContent_approvedAt_idx" ON "PublicContent"("approvedAt");
