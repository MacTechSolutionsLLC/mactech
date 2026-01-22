-- CreateTable: PhysicalAccessLog
-- For PE.L1-3.10.4 compliance - Physical access logging
CREATE TABLE "PhysicalAccessLog" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "timeIn" TEXT NOT NULL,
    "timeOut" TEXT,
    "personName" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "hostEscort" TEXT,
    "location" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" TEXT NOT NULL,

    CONSTRAINT "PhysicalAccessLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PhysicalAccessLog_date_idx" ON "PhysicalAccessLog"("date");
CREATE INDEX "PhysicalAccessLog_location_idx" ON "PhysicalAccessLog"("location");
CREATE INDEX "PhysicalAccessLog_createdAt_idx" ON "PhysicalAccessLog"("createdAt");
CREATE INDEX "PhysicalAccessLog_createdByUserId_idx" ON "PhysicalAccessLog"("createdByUserId");

-- AddForeignKey
ALTER TABLE "PhysicalAccessLog" ADD CONSTRAINT "PhysicalAccessLog_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateTable: EndpointInventory
-- For SI.L1-3.14.2 compliance - Endpoint protection inventory
CREATE TABLE "EndpointInventory" (
    "id" TEXT NOT NULL,
    "deviceIdentifier" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "os" TEXT NOT NULL,
    "avEnabled" BOOLEAN NOT NULL DEFAULT false,
    "lastVerifiedDate" TIMESTAMP(3),
    "verificationMethod" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EndpointInventory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EndpointInventory_deviceIdentifier_idx" ON "EndpointInventory"("deviceIdentifier");
CREATE INDEX "EndpointInventory_owner_idx" ON "EndpointInventory"("owner");
CREATE INDEX "EndpointInventory_lastVerifiedDate_idx" ON "EndpointInventory"("lastVerifiedDate");
