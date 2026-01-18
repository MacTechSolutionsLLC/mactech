-- AlterTable
ALTER TABLE "GovernmentContractDiscovery" ADD COLUMN IF NOT EXISTS "pipeline_status" TEXT NOT NULL DEFAULT 'discovered',
ADD COLUMN IF NOT EXISTS "pipeline_stage" TEXT,
ADD COLUMN IF NOT EXISTS "pipeline_errors" TEXT NOT NULL DEFAULT '[]',
ADD COLUMN IF NOT EXISTS "auto_processed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "pipeline_started_at" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "pipeline_completed_at" TIMESTAMP(3);

