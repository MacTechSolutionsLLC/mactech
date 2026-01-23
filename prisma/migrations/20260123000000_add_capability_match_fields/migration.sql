-- AlterTable: Add capability matching fields to GovernmentContractDiscovery
-- These fields store capability match scores and matched capabilities from resumes, services, showcases, and pillars

-- Add capability matching fields
ALTER TABLE "GovernmentContractDiscovery" 
ADD COLUMN IF NOT EXISTS "capability_match_score" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "matched_resume_skills" TEXT,
ADD COLUMN IF NOT EXISTS "matched_services" TEXT,
ADD COLUMN IF NOT EXISTS "matched_showcases" TEXT,
ADD COLUMN IF NOT EXISTS "primary_pillar" TEXT,
ADD COLUMN IF NOT EXISTS "capability_match_breakdown" TEXT,
ADD COLUMN IF NOT EXISTS "capability_match_calculated_at" TIMESTAMP(3);
