-- AlterTable
ALTER TABLE "GovernmentContractDiscovery" ADD COLUMN IF NOT EXISTS "incumbent_vendors" TEXT,
ADD COLUMN IF NOT EXISTS "competitive_landscape_summary" TEXT,
ADD COLUMN IF NOT EXISTS "capture_status" TEXT;

-- CreateTable
CREATE TABLE IF NOT EXISTS "OpportunityAwardLink" (
    "id" TEXT NOT NULL,
    "opportunity_id" TEXT NOT NULL,
    "award_id" TEXT NOT NULL,
    "join_confidence" DOUBLE PRECISION,
    "join_method" TEXT,
    "similarity_score" DOUBLE PRECISION,
    "matched_naics" TEXT,
    "matched_agency" TEXT,
    "title_similarity" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OpportunityAwardLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "IngestionStatus" (
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "batch_id" TEXT,
    "sam_gov_outage" BOOLEAN NOT NULL DEFAULT false,
    "sam_gov_outage_detected_at" TIMESTAMP(3),
    "sam_gov_outage_resolved_at" TIMESTAMP(3),
    "sam_gov_outage_reason" TEXT,
    "last_run_started_at" TIMESTAMP(3),
    "last_run_completed_at" TIMESTAMP(3),
    "last_run_duration_ms" INTEGER,
    "last_fetched" INTEGER NOT NULL DEFAULT 0,
    "last_deduplicated" INTEGER NOT NULL DEFAULT 0,
    "last_passed_filters" INTEGER NOT NULL DEFAULT 0,
    "last_scored_above_50" INTEGER NOT NULL DEFAULT 0,
    "last_error" TEXT,
    "error_count" INTEGER NOT NULL DEFAULT 0,
    "retry_count" INTEGER NOT NULL DEFAULT 0,
    "next_retry_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IngestionStatus_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "OpportunityAwardLink_opportunity_id_idx" ON "OpportunityAwardLink"("opportunity_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "OpportunityAwardLink_award_id_idx" ON "OpportunityAwardLink"("award_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "OpportunityAwardLink_join_confidence_idx" ON "OpportunityAwardLink"("join_confidence");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "OpportunityAwardLink_opportunity_id_award_id_key" ON "OpportunityAwardLink"("opportunity_id", "award_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "IngestionStatus_status_idx" ON "IngestionStatus"("status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "IngestionStatus_sam_gov_outage_idx" ON "IngestionStatus"("sam_gov_outage");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "IngestionStatus_last_run_started_at_idx" ON "IngestionStatus"("last_run_started_at");

-- AddForeignKey (PostgreSQL doesn't support IF NOT EXISTS for constraints, so we check first)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'OpportunityAwardLink_opportunity_id_fkey'
    ) THEN
        ALTER TABLE "OpportunityAwardLink" ADD CONSTRAINT "OpportunityAwardLink_opportunity_id_fkey" 
        FOREIGN KEY ("opportunity_id") REFERENCES "GovernmentContractDiscovery"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'OpportunityAwardLink_award_id_fkey'
    ) THEN
        ALTER TABLE "OpportunityAwardLink" ADD CONSTRAINT "OpportunityAwardLink_award_id_fkey" 
        FOREIGN KEY ("award_id") REFERENCES "UsaSpendingAward"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

