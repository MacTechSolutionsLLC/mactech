-- CreateTable
CREATE TABLE "UsaSpendingAward" (
    "id" TEXT NOT NULL,
    "award_id" TEXT,
    "generated_unique_award_id" TEXT,
    "award_type" TEXT,
    "award_type_description" TEXT,
    "category" TEXT,
    "piid" TEXT,
    "fain" TEXT,
    "uri" TEXT,
    "total_obligation" DOUBLE PRECISION,
    "total_outlay" DOUBLE PRECISION,
    "total_subsidy_cost" DOUBLE PRECISION,
    "awarding_agency" TEXT,
    "funding_agency" TEXT,
    "awarding_agency_name" TEXT,
    "funding_agency_name" TEXT,
    "awarding_agency_id" TEXT,
    "funding_agency_id" TEXT,
    "recipient_name" TEXT,
    "recipient_uei" TEXT,
    "recipient_duns" TEXT,
    "recipient_hash" TEXT,
    "recipient_id" TEXT,
    "recipient_location" TEXT,
    "place_of_performance" TEXT,
    "pop_state" TEXT,
    "pop_country" TEXT,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "last_modified_date" TIMESTAMP(3),
    "awarding_date" TIMESTAMP(3),
    "period_of_performance" TEXT,
    "naics_code" TEXT,
    "naics_description" TEXT,
    "psc_code" TEXT,
    "psc_description" TEXT,
    "cfda_number" TEXT,
    "cfda_title" TEXT,
    "description" TEXT,
    "transaction_count" INTEGER NOT NULL DEFAULT 0,
    "total_subaward_amount" DOUBLE PRECISION,
    "subaward_count" INTEGER NOT NULL DEFAULT 0,
    "raw_data" TEXT,
    "ingested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "ingestion_batch_id" TEXT,

    CONSTRAINT "UsaSpendingAward_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsaSpendingTransaction" (
    "id" TEXT NOT NULL,
    "transaction_id" TEXT,
    "award_id" TEXT,
    "action_date" TIMESTAMP(3),
    "action_type" TEXT,
    "action_type_description" TEXT,
    "federal_action_obligation" DOUBLE PRECISION,
    "total_obligation" DOUBLE PRECISION,
    "total_outlay" DOUBLE PRECISION,
    "awarding_agency" TEXT,
    "funding_agency" TEXT,
    "awarding_agency_name" TEXT,
    "funding_agency_name" TEXT,
    "recipient" TEXT,
    "recipient_name" TEXT,
    "recipient_uei" TEXT,
    "recipient_duns" TEXT,
    "raw_data" TEXT,
    "ingested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UsaSpendingTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UsaSpendingAward_award_id_key" ON "UsaSpendingAward"("award_id");

-- CreateIndex
CREATE UNIQUE INDEX "UsaSpendingAward_generated_unique_award_id_key" ON "UsaSpendingAward"("generated_unique_award_id");

-- CreateIndex
CREATE INDEX "UsaSpendingAward_award_id_idx" ON "UsaSpendingAward"("award_id");

-- CreateIndex
CREATE INDEX "UsaSpendingAward_award_type_idx" ON "UsaSpendingAward"("award_type");

-- CreateIndex
CREATE INDEX "UsaSpendingAward_awarding_agency_id_idx" ON "UsaSpendingAward"("awarding_agency_id");

-- CreateIndex
CREATE INDEX "UsaSpendingAward_funding_agency_id_idx" ON "UsaSpendingAward"("funding_agency_id");

-- CreateIndex
CREATE INDEX "UsaSpendingAward_recipient_uei_idx" ON "UsaSpendingAward"("recipient_uei");

-- CreateIndex
CREATE INDEX "UsaSpendingAward_recipient_duns_idx" ON "UsaSpendingAward"("recipient_duns");

-- CreateIndex
CREATE INDEX "UsaSpendingAward_naics_code_idx" ON "UsaSpendingAward"("naics_code");

-- CreateIndex
CREATE INDEX "UsaSpendingAward_psc_code_idx" ON "UsaSpendingAward"("psc_code");

-- CreateIndex
CREATE INDEX "UsaSpendingAward_pop_state_idx" ON "UsaSpendingAward"("pop_state");

-- CreateIndex
CREATE INDEX "UsaSpendingAward_awarding_date_idx" ON "UsaSpendingAward"("awarding_date");

-- CreateIndex
CREATE INDEX "UsaSpendingAward_start_date_idx" ON "UsaSpendingAward"("start_date");

-- CreateIndex
CREATE INDEX "UsaSpendingAward_end_date_idx" ON "UsaSpendingAward"("end_date");

-- CreateIndex
CREATE INDEX "UsaSpendingAward_ingested_at_idx" ON "UsaSpendingAward"("ingested_at");

-- CreateIndex
CREATE UNIQUE INDEX "UsaSpendingTransaction_transaction_id_key" ON "UsaSpendingTransaction"("transaction_id");

-- CreateIndex
CREATE INDEX "UsaSpendingTransaction_transaction_id_idx" ON "UsaSpendingTransaction"("transaction_id");

-- CreateIndex
CREATE INDEX "UsaSpendingTransaction_award_id_idx" ON "UsaSpendingTransaction"("award_id");

-- CreateIndex
CREATE INDEX "UsaSpendingTransaction_action_date_idx" ON "UsaSpendingTransaction"("action_date");

-- CreateIndex
CREATE INDEX "UsaSpendingTransaction_recipient_uei_idx" ON "UsaSpendingTransaction"("recipient_uei");

-- CreateIndex
CREATE INDEX "UsaSpendingTransaction_recipient_duns_idx" ON "UsaSpendingTransaction"("recipient_duns");

-- AddForeignKey
ALTER TABLE "UsaSpendingTransaction" ADD CONSTRAINT "UsaSpendingTransaction_award_id_fkey" FOREIGN KEY ("award_id") REFERENCES "UsaSpendingAward"("id") ON DELETE CASCADE ON UPDATE CASCADE;

