-- AlterTable: Add USAspending enrichment fields to GovernmentContractDiscovery
-- These fields are required for the 3-tier API ingestion workflow
ALTER TABLE "GovernmentContractDiscovery" 
ADD COLUMN IF NOT EXISTS "usaspending_enrichment" TEXT,
ADD COLUMN IF NOT EXISTS "usaspending_enriched_at" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "usaspending_enrichment_status" TEXT;

-- Also ensure recipient_entity_data exists on UsaSpendingAward (for SAM.gov Entity API enrichment)
ALTER TABLE "UsaSpendingAward"
ADD COLUMN IF NOT EXISTS "recipient_entity_data" TEXT;

