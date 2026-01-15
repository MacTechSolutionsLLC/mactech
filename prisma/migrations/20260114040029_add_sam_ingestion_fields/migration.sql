-- CreateTable
CREATE TABLE "ReadinessAssessment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "organization" TEXT,
    "systemType" TEXT NOT NULL,
    "authStatus" TEXT NOT NULL,
    "auditHistory" TEXT NOT NULL,
    "infraMaturity" TEXT NOT NULL,
    "timelinePressure" TEXT NOT NULL,
    "readinessScore" TEXT NOT NULL,
    "gapsSummary" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ContactSubmission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "organization" TEXT,
    "phone" TEXT,
    "message" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "GovernmentContractDiscovery" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "google_query" TEXT NOT NULL,
    "service_category" TEXT,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "snippet" TEXT,
    "document_type" TEXT,
    "notice_id" TEXT,
    "solicitation_number" TEXT,
    "agency" TEXT,
    "naics_codes" TEXT NOT NULL DEFAULT '[]',
    "set_aside" TEXT NOT NULL DEFAULT '[]',
    "location_mentions" TEXT NOT NULL DEFAULT '[]',
    "detected_keywords" TEXT NOT NULL DEFAULT '[]',
    "relevance_score" INTEGER NOT NULL DEFAULT 0,
    "ingestion_status" TEXT NOT NULL DEFAULT 'discovered',
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verified_at" DATETIME,
    "verified_by" TEXT,
    "downloaded" BOOLEAN NOT NULL DEFAULT false,
    "downloaded_at" DATETIME,
    "proposal_generated" BOOLEAN NOT NULL DEFAULT false,
    "proposal_generated_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "discovered_by" TEXT,
    "ingestion_source" TEXT,
    "ingestion_batch_id" TEXT,
    "flagged" BOOLEAN NOT NULL DEFAULT false,
    "flagged_at" DATETIME,
    "flagged_by" TEXT,
    "scraped" BOOLEAN NOT NULL DEFAULT false,
    "scraped_at" DATETIME,
    "scraped_html_content" TEXT,
    "scraped_text_content" TEXT,
    "sow_attachment_url" TEXT,
    "sow_attachment_type" TEXT,
    "sow_attachment_content" TEXT,
    "sow_scraped" BOOLEAN NOT NULL DEFAULT false,
    "sow_scraped_at" DATETIME,
    "analysis_summary" TEXT,
    "analysis_confidence" REAL,
    "analysis_keywords" TEXT NOT NULL DEFAULT '[]',
    "aiParsedData" TEXT,
    "aiParsedAt" DATETIME,
    "aiSummary" TEXT,
    "aiKeyRequirements" TEXT,
    "aiKeywords" TEXT,
    "aiStrengths" TEXT,
    "aiConcerns" TEXT,
    "aiFitScore" REAL,
    "aiServiceCategory" TEXT,
    "aiRecommendedActions" TEXT,
    "aiAnalysisGeneratedAt" DATETIME,
    "aiAwardLikelihood" REAL,
    "aiAwardConfidence" TEXT,
    "aiAwardReasoning" TEXT,
    "aiAwardStrengths" TEXT,
    "aiAwardConcerns" TEXT,
    "aiAwardRiskFactors" TEXT,
    "aiAwardRecommendations" TEXT,
    "aiAwardLikelihoodGeneratedAt" DATETIME,
    "dismissed" BOOLEAN NOT NULL DEFAULT false,
    "dismissed_at" DATETIME,
    "dismissed_by" TEXT,
    "dismissal_reason" TEXT,
    "points_of_contact" TEXT,
    "description" TEXT,
    "requirements" TEXT,
    "deadline" TEXT,
    "estimated_value" TEXT,
    "period_of_performance" TEXT,
    "place_of_performance" TEXT
);

-- CreateTable
CREATE TABLE "IgnoredOpportunity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "notice_id" TEXT NOT NULL,
    "ignored_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ignored_by" TEXT,
    "reason" TEXT
);

-- CreateTable
CREATE TABLE "Deployment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "architecture" TEXT NOT NULL,
    "storageType" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "systemId" TEXT,
    "vmwareConfig" TEXT,
    "networkConfig" TEXT,
    "compliance" TEXT,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deployedAt" DATETIME
);

-- CreateTable
CREATE TABLE "SystemHealth" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "systemId" TEXT NOT NULL,
    "systemName" TEXT NOT NULL,
    "systemType" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "metrics" TEXT,
    "alerts" TEXT,
    "lastUpdated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "NetworkTopology" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "zones" TEXT NOT NULL,
    "requirements" TEXT,
    "status" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "FirewallRule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "topologyId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "port" TEXT NOT NULL,
    "protocol" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ISOComplianceProgram" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "standard" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SOP" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "requirement" TEXT NOT NULL,
    "standard" TEXT,
    "version" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "approvedAt" DATETIME
);

-- CreateTable
CREATE TABLE "MetrologyProject" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectName" TEXT NOT NULL,
    "equipmentId" TEXT,
    "status" TEXT NOT NULL,
    "dueDate" DATETIME,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ComplianceGap" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "programId" TEXT NOT NULL,
    "requirement" TEXT NOT NULL,
    "clause" TEXT NOT NULL,
    "currentStatus" TEXT NOT NULL,
    "remediation" TEXT NOT NULL,
    "priority" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "AuditReadiness" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "systemId" TEXT NOT NULL,
    "auditType" TEXT NOT NULL,
    "auditDate" DATETIME,
    "readinessScore" INTEGER NOT NULL,
    "readinessLevel" TEXT NOT NULL,
    "gaps" TEXT NOT NULL,
    "strengths" TEXT NOT NULL,
    "recommendations" TEXT NOT NULL,
    "metadata" TEXT,
    "status" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AuditEvidencePackage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "auditId" TEXT NOT NULL,
    "evidence" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME
);

-- CreateTable
CREATE TABLE "Contract" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "riskScore" INTEGER,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "signedAt" DATETIME,
    "expiresAt" DATETIME
);

-- CreateTable
CREATE TABLE "LegalDocument" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "documentType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "parties" TEXT NOT NULL,
    "terms" TEXT,
    "version" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "approvedAt" DATETIME,
    "signedAt" DATETIME
);

-- CreateTable
CREATE TABLE "DocumentReview" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "documentId" TEXT NOT NULL,
    "reviewer" TEXT NOT NULL,
    "reviewDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "risks" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ContractObligation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "contractId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "dueDate" DATETIME NOT NULL,
    "status" TEXT NOT NULL,
    "completedAt" DATETIME
);

-- CreateTable
CREATE TABLE "RMFRequirement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "systemId" TEXT NOT NULL,
    "controlId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "implementationStatus" TEXT NOT NULL,
    "traceabilityId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "BOEPlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "systemId" TEXT NOT NULL,
    "controlId" TEXT NOT NULL,
    "evidenceType" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "dueDate" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SecurityBaseline" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "systemType" TEXT NOT NULL,
    "controls" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "approvedAt" DATETIME
);

-- CreateTable
CREATE TABLE "SecurityDocument" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "documentType" TEXT NOT NULL,
    "systemId" TEXT NOT NULL,
    "systemName" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "approvedAt" DATETIME
);

-- CreateTable
CREATE TABLE "CVEAnalysis" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "softwareName" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "riskLevel" TEXT NOT NULL,
    "recommendation" TEXT NOT NULL,
    "cves" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME
);

-- CreateTable
CREATE TABLE "VulnerabilityFinding" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "scanId" TEXT NOT NULL,
    "cveId" TEXT,
    "title" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "remediation" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "VulnerabilityScan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "systemId" TEXT NOT NULL,
    "scanType" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME
);

-- CreateTable
CREATE TABLE "STIGValidation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "systemId" TEXT NOT NULL,
    "stigProfile" TEXT NOT NULL,
    "systemType" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "results" TEXT,
    "remediation" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME
);

-- CreateTable
CREATE TABLE "Evidence" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "controlId" TEXT NOT NULL,
    "systemId" TEXT NOT NULL,
    "evidenceType" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "qualityScore" INTEGER,
    "collectedAt" DATETIME,
    "validatedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "RMFArtifact" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "artifactType" TEXT NOT NULL,
    "systemId" TEXT NOT NULL,
    "systemName" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "qualityScore" INTEGER,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "approvedAt" DATETIME
);

-- CreateTable
CREATE TABLE "Ticket" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT,
    "priority" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "requester" TEXT NOT NULL,
    "assignedTo" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "resolvedAt" DATETIME,
    "slaDeadline" DATETIME
);

-- CreateTable
CREATE TABLE "KnowledgeArticle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" TEXT,
    "status" TEXT NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "helpful" INTEGER NOT NULL DEFAULT 0,
    "notHelpful" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "lastViewedAt" DATETIME
);

-- CreateTable
CREATE TABLE "TeamMember" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "performanceScore" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PerformanceReview" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teamMemberId" TEXT NOT NULL,
    "reviewDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewer" TEXT NOT NULL,
    "overallRating" TEXT NOT NULL,
    "reviewData" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "GovernmentContractDiscovery_url_key" ON "GovernmentContractDiscovery"("url");

-- CreateIndex
CREATE UNIQUE INDEX "IgnoredOpportunity_notice_id_key" ON "IgnoredOpportunity"("notice_id");

-- CreateIndex
CREATE INDEX "IgnoredOpportunity_notice_id_idx" ON "IgnoredOpportunity"("notice_id");

-- CreateIndex
CREATE INDEX "Deployment_systemId_idx" ON "Deployment"("systemId");

-- CreateIndex
CREATE INDEX "Deployment_status_idx" ON "Deployment"("status");

-- CreateIndex
CREATE UNIQUE INDEX "SystemHealth_systemId_key" ON "SystemHealth"("systemId");

-- CreateIndex
CREATE INDEX "SystemHealth_status_idx" ON "SystemHealth"("status");

-- CreateIndex
CREATE INDEX "SystemHealth_systemType_idx" ON "SystemHealth"("systemType");

-- CreateIndex
CREATE INDEX "NetworkTopology_status_idx" ON "NetworkTopology"("status");

-- CreateIndex
CREATE INDEX "FirewallRule_topologyId_idx" ON "FirewallRule"("topologyId");

-- CreateIndex
CREATE INDEX "ISOComplianceProgram_organizationId_idx" ON "ISOComplianceProgram"("organizationId");

-- CreateIndex
CREATE INDEX "ISOComplianceProgram_standard_idx" ON "ISOComplianceProgram"("standard");

-- CreateIndex
CREATE INDEX "SOP_status_idx" ON "SOP"("status");

-- CreateIndex
CREATE INDEX "SOP_standard_idx" ON "SOP"("standard");

-- CreateIndex
CREATE INDEX "MetrologyProject_equipmentId_idx" ON "MetrologyProject"("equipmentId");

-- CreateIndex
CREATE INDEX "MetrologyProject_status_idx" ON "MetrologyProject"("status");

-- CreateIndex
CREATE INDEX "ComplianceGap_programId_idx" ON "ComplianceGap"("programId");

-- CreateIndex
CREATE INDEX "AuditReadiness_systemId_idx" ON "AuditReadiness"("systemId");

-- CreateIndex
CREATE INDEX "AuditReadiness_auditType_idx" ON "AuditReadiness"("auditType");

-- CreateIndex
CREATE INDEX "AuditReadiness_status_idx" ON "AuditReadiness"("status");

-- CreateIndex
CREATE INDEX "AuditEvidencePackage_auditId_idx" ON "AuditEvidencePackage"("auditId");

-- CreateIndex
CREATE INDEX "AuditEvidencePackage_status_idx" ON "AuditEvidencePackage"("status");

-- CreateIndex
CREATE INDEX "Contract_status_idx" ON "Contract"("status");

-- CreateIndex
CREATE INDEX "Contract_type_idx" ON "Contract"("type");

-- CreateIndex
CREATE INDEX "Contract_expiresAt_idx" ON "Contract"("expiresAt");

-- CreateIndex
CREATE INDEX "LegalDocument_documentType_idx" ON "LegalDocument"("documentType");

-- CreateIndex
CREATE INDEX "LegalDocument_status_idx" ON "LegalDocument"("status");

-- CreateIndex
CREATE INDEX "DocumentReview_documentId_idx" ON "DocumentReview"("documentId");

-- CreateIndex
CREATE INDEX "DocumentReview_status_idx" ON "DocumentReview"("status");

-- CreateIndex
CREATE INDEX "ContractObligation_contractId_idx" ON "ContractObligation"("contractId");

-- CreateIndex
CREATE INDEX "ContractObligation_status_idx" ON "ContractObligation"("status");

-- CreateIndex
CREATE INDEX "ContractObligation_dueDate_idx" ON "ContractObligation"("dueDate");

-- CreateIndex
CREATE INDEX "RMFRequirement_systemId_idx" ON "RMFRequirement"("systemId");

-- CreateIndex
CREATE INDEX "RMFRequirement_controlId_idx" ON "RMFRequirement"("controlId");

-- CreateIndex
CREATE INDEX "RMFRequirement_implementationStatus_idx" ON "RMFRequirement"("implementationStatus");

-- CreateIndex
CREATE INDEX "BOEPlan_systemId_idx" ON "BOEPlan"("systemId");

-- CreateIndex
CREATE INDEX "BOEPlan_controlId_idx" ON "BOEPlan"("controlId");

-- CreateIndex
CREATE INDEX "BOEPlan_status_idx" ON "BOEPlan"("status");

-- CreateIndex
CREATE INDEX "SecurityBaseline_status_idx" ON "SecurityBaseline"("status");

-- CreateIndex
CREATE INDEX "SecurityBaseline_systemType_idx" ON "SecurityBaseline"("systemType");

-- CreateIndex
CREATE INDEX "SecurityDocument_systemId_idx" ON "SecurityDocument"("systemId");

-- CreateIndex
CREATE INDEX "SecurityDocument_documentType_idx" ON "SecurityDocument"("documentType");

-- CreateIndex
CREATE INDEX "SecurityDocument_status_idx" ON "SecurityDocument"("status");

-- CreateIndex
CREATE INDEX "CVEAnalysis_status_idx" ON "CVEAnalysis"("status");

-- CreateIndex
CREATE INDEX "CVEAnalysis_riskLevel_idx" ON "CVEAnalysis"("riskLevel");

-- CreateIndex
CREATE INDEX "VulnerabilityFinding_scanId_idx" ON "VulnerabilityFinding"("scanId");

-- CreateIndex
CREATE INDEX "VulnerabilityFinding_severity_idx" ON "VulnerabilityFinding"("severity");

-- CreateIndex
CREATE INDEX "VulnerabilityFinding_status_idx" ON "VulnerabilityFinding"("status");

-- CreateIndex
CREATE INDEX "VulnerabilityScan_systemId_idx" ON "VulnerabilityScan"("systemId");

-- CreateIndex
CREATE INDEX "VulnerabilityScan_status_idx" ON "VulnerabilityScan"("status");

-- CreateIndex
CREATE INDEX "STIGValidation_systemId_idx" ON "STIGValidation"("systemId");

-- CreateIndex
CREATE INDEX "STIGValidation_status_idx" ON "STIGValidation"("status");

-- CreateIndex
CREATE INDEX "Evidence_systemId_idx" ON "Evidence"("systemId");

-- CreateIndex
CREATE INDEX "Evidence_controlId_idx" ON "Evidence"("controlId");

-- CreateIndex
CREATE INDEX "Evidence_status_idx" ON "Evidence"("status");

-- CreateIndex
CREATE INDEX "RMFArtifact_systemId_idx" ON "RMFArtifact"("systemId");

-- CreateIndex
CREATE INDEX "RMFArtifact_artifactType_idx" ON "RMFArtifact"("artifactType");

-- CreateIndex
CREATE INDEX "RMFArtifact_status_idx" ON "RMFArtifact"("status");

-- CreateIndex
CREATE INDEX "Ticket_status_idx" ON "Ticket"("status");

-- CreateIndex
CREATE INDEX "Ticket_priority_idx" ON "Ticket"("priority");

-- CreateIndex
CREATE INDEX "Ticket_assignedTo_idx" ON "Ticket"("assignedTo");

-- CreateIndex
CREATE INDEX "KnowledgeArticle_status_idx" ON "KnowledgeArticle"("status");

-- CreateIndex
CREATE INDEX "KnowledgeArticle_category_idx" ON "KnowledgeArticle"("category");

-- CreateIndex
CREATE UNIQUE INDEX "TeamMember_email_key" ON "TeamMember"("email");

-- CreateIndex
CREATE INDEX "TeamMember_role_idx" ON "TeamMember"("role");

-- CreateIndex
CREATE INDEX "PerformanceReview_teamMemberId_idx" ON "PerformanceReview"("teamMemberId");

-- CreateIndex
CREATE INDEX "PerformanceReview_reviewDate_idx" ON "PerformanceReview"("reviewDate");
