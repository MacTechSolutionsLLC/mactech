-- AlterTable: Add resource_links and smart_sort fields to GovernmentContractDiscovery
-- These fields support explicit information display and AI-enhanced sorting

-- Add resource_links field for categorized link storage
ALTER TABLE "GovernmentContractDiscovery" 
ADD COLUMN IF NOT EXISTS "resource_links" TEXT;

-- Add smart_sort fields for AI-enhanced sorting (optional caching)
ALTER TABLE "GovernmentContractDiscovery"
ADD COLUMN IF NOT EXISTS "smart_sort_score" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "smart_sort_reasoning" TEXT,
ADD COLUMN IF NOT EXISTS "smart_sort_calculated_at" TIMESTAMP(3);

