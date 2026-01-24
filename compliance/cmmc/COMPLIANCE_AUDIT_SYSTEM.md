# CMMC Level 2 Compliance Audit System

## Overview

The Compliance Audit System provides comprehensive automated verification of all 110 NIST SP 800-171 Rev. 2 controls. It verifies actual implementation status against code, evidence files, policies, and procedures to ensure true CMMC Level 2 readiness.

## Features

### 1. Automated Control Verification
- **Code Verification:** Verifies that implementation files exist and contain relevant code patterns
- **Evidence Verification:** Validates that all evidence files referenced in SCTM actually exist
- **Policy/Procedure Verification:** Confirms that referenced policies and procedures are present
- **Status Verification:** Compares claimed status against actual implementation evidence

### 2. Detailed Control Component
- **Enriched Data Display:** Shows implementation status, evidence files, code verification results**
- **Expandable Sections:** Collapsible sections for policies, procedures, evidence, and code
- **Compliance Scoring:** Each control receives a 0-100% compliance score based on evidence completeness
- **Issue Tracking:** Identifies and displays all issues found during verification

### 3. Audit Reporting
- **Summary Statistics:** Overall compliance metrics and breakdowns by status and family
- **Critical Issues:** Highlights controls requiring immediate attention
- **Detailed Reports:** Comprehensive markdown and JSON exports
- **Real-time Updates:** Audit results update automatically when controls are expanded

## Usage

### Web Interface

1. **Access Audit Dashboard:**
   - Navigate to `/admin/compliance/audit`
   - View summary statistics and compliance breakdowns

2. **View Control Details:**
   - Navigate to `/admin/compliance/sctm`
   - Click on any control row to expand detailed view
   - Audit results load automatically when control is expanded

3. **Run Full Audit:**
   - Click "Run Full Audit" button on audit dashboard
   - Review summary and critical issues
   - Export results if needed

### Command Line

Run the audit script to generate comprehensive reports:

```bash
npx tsx scripts/run-compliance-audit.ts
```

This generates:
- Console summary output
- Detailed markdown report: `compliance/cmmc/level1/04-self-assessment/MAC-AUD-409_Compliance_Audit_Report.md`
- JSON export: `compliance/cmmc/level1/04-self-assessment/compliance-audit-results.json`

## Audit Process

### 1. Control Parsing
- Reads SCTM markdown file
- Extracts all 110 controls with their metadata
- Parses status, policies, procedures, evidence, and implementation references

### 2. Evidence Verification
For each control, the system verifies:

**Policies:**
- Checks if policy files exist in `compliance/cmmc/level1/02-policies-and-procedures/`
- Validates file naming convention (MAC-POL-XXX.md)

**Procedures:**
- Checks if procedure files exist in `compliance/cmmc/level1/02-policies-and-procedures/`
- Validates file naming convention (MAC-SOP-XXX.md)

**Evidence Files:**
- Checks evidence reports in `compliance/cmmc/level1/05-evidence/`
- Searches subdirectories (audit-log-reviews, endpoint-verifications, etc.)
- Validates file naming convention (MAC-RPT-XXX.md)

**Code Implementation:**
- Verifies implementation files exist (e.g., `lib/auth.ts`, `middleware.ts`)
- Searches for relevant code patterns based on control family
- Validates that code actually implements the control requirement

### 3. Compliance Scoring

Each control receives a compliance score (0-100%) based on:

- **Policy Verification (20 points):** All referenced policies exist
- **Procedure Verification (20 points):** All referenced procedures exist
- **Evidence Files (30 points):** All evidence files are present
- **Code Implementation (30 points):** Implementation files exist and contain relevant code

### 4. Status Verification

The system compares claimed status against verified evidence:

- **Verified:** Claimed status matches evidence
- **Needs Review:** Discrepancies found, requires manual review
- **Discrepancy:** Significant mismatch between claimed and actual status

## Control Detail Component

The `ControlDetail` component provides enriched information for each control:

### Sections

1. **Overview**
   - Control ID, requirement, status
   - Policy, procedure, implementation references
   - SSP section references
   - Issues summary

2. **Policies**
   - List of referenced policies
   - Existence verification
   - File paths and links

3. **Procedures**
   - List of referenced procedures
   - Existence verification
   - File paths and links

4. **Evidence Files**
   - List of evidence reports
   - Existence verification
   - Direct links to evidence files

5. **Code Implementation**
   - Implementation files
   - Code verification status
   - Relevant code snippets
   - Links to source code

6. **Verification Details**
   - Claimed vs. verified status
   - Compliance score with visual indicator
   - Last verification timestamp

## API Endpoints

### GET `/api/compliance/audit`
Runs full audit on all controls and returns summary + results.

**Response:**
```json
{
  "success": true,
  "summary": {
    "total": 110,
    "verified": 85,
    "needsReview": 15,
    "discrepancies": 2,
    "averageComplianceScore": 87,
    "byStatus": {...},
    "byFamily": {...},
    "criticalIssues": [...]
  },
  "results": [...],
  "generatedAt": "2026-01-24T..."
}
```

### GET `/api/compliance/audit/[controlId]`
Audits a specific control and returns detailed results.

**Response:**
```json
{
  "success": true,
  "control": {...},
  "auditResult": {
    "controlId": "3.1.1",
    "verifiedStatus": "implemented",
    "verificationStatus": "verified",
    "issues": [],
    "evidence": {...},
    "complianceScore": 95,
    "lastVerified": "2026-01-24T..."
  }
}
```

## File Structure

```
lib/compliance/
  ├── control-audit.ts          # Core audit logic
  ├── sctm-parser.ts            # SCTM markdown parser

components/compliance/
  ├── ControlDetail.tsx         # Detailed control component
  ├── AuditSummary.tsx          # Audit summary dashboard
  ├── SCTMTable.tsx             # Updated with audit integration
  └── SCTMSummary.tsx           # SCTM summary statistics

app/api/compliance/audit/
  ├── route.ts                   # Full audit endpoint
  └── [controlId]/route.ts      # Single control audit

app/admin/compliance/
  ├── audit/page.tsx             # Audit dashboard page
  └── sctm/page.tsx              # SCTM page with audit integration

scripts/
  └── run-compliance-audit.ts   # CLI audit script
```

## Compliance Score Calculation

### Scoring Breakdown

- **100%:** All evidence present, code verified, no issues
- **80-99%:** Minor issues, most evidence present
- **50-79%:** Significant gaps, some evidence missing
- **0-49%:** Major issues, critical evidence missing

### Status Adjustments

- **Not Applicable:** Automatically 100% (control doesn't apply)
- **Inherited:** +20 point bonus (provided by service provider)
- **Implemented:** Standard scoring based on evidence
- **Partially Satisfied:** Reduced scoring due to gaps
- **Not Implemented:** 0% unless evidence suggests otherwise

## Best Practices

1. **Regular Audits:** Run full audit monthly or after major changes
2. **Address Critical Issues:** Prioritize controls with compliance scores < 50%
3. **Update SCTM:** Keep SCTM synchronized with actual implementation
4. **Evidence Maintenance:** Ensure all evidence files are current and accessible
5. **Code Documentation:** Document how code implements each control

## Troubleshooting

### Common Issues

**"Policy file not found"**
- Verify file exists in `compliance/cmmc/level1/02-policies-and-procedures/`
- Check naming convention matches SCTM reference (MAC-POL-XXX.md)

**"Evidence file not found"**
- Check if file exists in `compliance/cmmc/level1/05-evidence/`
- Verify subdirectory structure (some evidence may be in subdirectories)
- Ensure naming convention matches SCTM reference

**"No relevant code patterns found"**
- Review control requirement and implementation
- Update code patterns in `getCodePatternsForControl()` if needed
- Verify implementation file path is correct

**"Low compliance score"**
- Review all evidence sections for missing items
- Ensure policies, procedures, and evidence files exist
- Verify code implementation matches control requirement

## Future Enhancements

- [ ] Automated evidence file generation
- [ ] Integration with CI/CD pipeline
- [ ] Historical audit tracking
- [ ] Automated POA&M generation from audit results
- [ ] Evidence file content validation
- [ ] Code pattern learning from verified controls

## Related Documentation

- [System Control Traceability Matrix](../level1/04-self-assessment/MAC-AUD-408_System_Control_Traceability_Matrix.md)
- [System Security Plan](../level1/01-system-scope/MAC-IT-304_System_Security_Plan.md)
- [Compliance Dashboard](../../../app/admin/compliance/page.tsx)

---

**Last Updated:** 2026-01-24  
**Version:** 1.0
