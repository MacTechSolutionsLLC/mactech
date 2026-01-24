-- CreateTable
CREATE TABLE "POAMItem" (
    "id" TEXT NOT NULL,
    "poamId" TEXT NOT NULL,
    "controlId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "affectedControls" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "responsibleParty" TEXT NOT NULL,
    "targetCompletionDate" TIMESTAMP(3),
    "actualCompletionDate" TIMESTAMP(3),
    "plannedRemediation" TEXT NOT NULL,
    "milestones" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "verifiedBy" TEXT,
    "verifiedAt" TIMESTAMP(3),

    CONSTRAINT "POAMItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "POAMItem_poamId_key" ON "POAMItem"("poamId");

-- CreateIndex
CREATE INDEX "POAMItem_status_idx" ON "POAMItem"("status");

-- CreateIndex
CREATE INDEX "POAMItem_priority_idx" ON "POAMItem"("priority");

-- CreateIndex
CREATE INDEX "POAMItem_controlId_idx" ON "POAMItem"("controlId");

-- CreateIndex
CREATE INDEX "POAMItem_poamId_idx" ON "POAMItem"("poamId");

-- CreateIndex
CREATE INDEX "POAMItem_targetCompletionDate_idx" ON "POAMItem"("targetCompletionDate");
