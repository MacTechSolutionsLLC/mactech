-- AlterTable: Add capture intelligence fields to UsaSpendingAward
-- These fields support relevance scoring, signal generation, and enrichment tracking

-- Add capture intelligence fields
ALTER TABLE "UsaSpendingAward" 
ADD COLUMN IF NOT EXISTS "relevance_score" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "signals" TEXT,
ADD COLUMN IF NOT EXISTS "enrichment_status" TEXT,
ADD COLUMN IF NOT EXISTS "enriched_at" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "human_award_id" TEXT,
ADD COLUMN IF NOT EXISTS "generated_internal_id" TEXT;

-- Create unique index on generated_internal_id
CREATE UNIQUE INDEX IF NOT EXISTS "UsaSpendingAward_generated_internal_id_key" 
ON "UsaSpendingAward"("generated_internal_id") 
WHERE "generated_internal_id" IS NOT NULL;

-- Create index on relevance_score for sorting
CREATE INDEX IF NOT EXISTS "UsaSpendingAward_relevance_score_idx" 
ON "UsaSpendingAward"("relevance_score");

-- Create index on enrichment_status for filtering
CREATE INDEX IF NOT EXISTS "UsaSpendingAward_enrichment_status_idx" 
ON "UsaSpendingAward"("enrichment_status");
