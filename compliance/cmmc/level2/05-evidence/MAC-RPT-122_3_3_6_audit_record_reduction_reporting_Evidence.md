# Audit Record Reduction and Reporting Evidence - CMMC Level 2

**Document Version:** 2.0  
**Date:** 2026-01-24  
**Classification:** Internal Use  
**Compliance Framework:** CMMC 2.0 Level 2 (Advanced)  
**Reference:** NIST SP 800-171 Rev. 2, Section 3.3.6

**Control ID:** 3.3.6  
**Requirement:** Provide audit record reduction and report generation to support on-demand analysis and reporting

---

## 1. Purpose

This document provides evidence of the implementation of audit record reduction and report generation capabilities to support on-demand analysis and reporting, demonstrating compliance with NIST SP 800-171 Rev. 2, Section 3.3.6.

---

## 2. Implementation Summary

**Status:** ✅ Fully Implemented

**Implementation Date:** 2026-01-23

**Implementation Location:** 
- `lib/audit.ts` - `exportEventsCSV()` function
- `app/api/admin/events/export/route.ts` - Export API endpoint

---

## 3. Code Implementation

### 3.1 CSV Export Function

**File:** `lib/audit.ts`

**Function:** `exportEventsCSV(filters: EventFilters, metadata?: { exportedBy?: string; exportedByEmail?: string })`

**Purpose:** Exports audit events to CSV format with metadata headers for reporting.

**Code Implementation:**
```typescript
// lib/audit.ts (lines 587-637)
export async function exportEventsCSV(
  filters: EventFilters = {},
  metadata?: { exportedBy?: string; exportedByEmail?: string }
): Promise<string> {
  const { events } = await getEvents({ ...filters, limit: 10000 })

  // Metadata headers
  const metadataLines = [
    "# Evidence Export",
    `# Generated: ${new Date().toISOString()}`,
    "# System: MacTech Solutions Application",
    metadata?.exportedByEmail ? `# Exported By: ${metadata.exportedByEmail}` : "# Exported By: [System]",
    "# Export Type: Audit Log",
    "",
  ]

  // CSV header
  const headers = [
    "Timestamp",
    "Action Type",
    "Actor Email",
    "Target Type",
    "Target ID",
    "IP Address",
    "Success",
    "Details",
  ]

  // CSV rows
  const rows = events.map((event) => [
    event.timestamp.toISOString(),
    event.actionType,
    event.actorEmail || "",
    event.targetType || "",
    event.targetId || "",
    event.ip || "",
    event.success ? "true" : "false",
    event.details || "",
  ])

  // Combine metadata, header and rows
  const csv = [
    ...metadataLines,
    headers.join(","),
    ...rows.map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
    ),
  ].join("\n")

  return csv
}
```

**Code References:**
- `lib/audit.ts` - Lines 587-637 (exportEventsCSV function)
- Function exports events to CSV format

**Evidence:**
- `lib/audit.ts` - CSV export function exists
- Function supports on-demand reporting

---

### 3.2 Export API Endpoint

**File:** `app/api/admin/events/export/route.ts`

**Purpose:** Provides HTTP endpoint for audit log export (admin-only).

**Code Implementation:**
```typescript
// app/api/admin/events/export/route.ts (lines 10-46)
export async function GET(req: NextRequest) {
  try {
    const session = await requireAdmin()

    const searchParams = req.nextUrl.searchParams
    const startDate = searchParams.get("startDate")
      ? new Date(searchParams.get("startDate")!)
      : undefined
    const endDate = searchParams.get("endDate")
      ? new Date(searchParams.get("endDate")!)
      : undefined
    const actionType = searchParams.get("actionType") as any

    const filters = {
      startDate,
      endDate,
      actionType,
    }

    const csv = await exportEventsCSV(filters, {
      exportedBy: session.user.id,
      exportedByEmail: session.user.email || undefined,
    })

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="events-export-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to export events" },
      { status: error.message?.includes("Admin") ? 403 : 500 }
    )
  }
}
```

**Code References:**
- `app/api/admin/events/export/route.ts` - Export API endpoint
- Endpoint requires admin authentication

**Evidence:**
- Export API endpoint exists
- Endpoint supports filtered exports

---

### 3.3 Export Filtering Capabilities

**Filter Options:**
- **Date Range:** Filter by start date and end date
- **Action Type:** Filter by specific action types
- **User:** Filter by user ID (via getEvents function)
- **Target:** Filter by target type and ID
- **Success Status:** Filter by success/failure status

**Code References:**
- `lib/audit.ts` - getEvents function (lines 529-582)
- `app/api/admin/events/export/route.ts` - Filter parameters

**Evidence:**
- Multiple filter options supported
- Filtering enables targeted reporting

---

### 3.4 Report Generation Features

**Report Features:**
- CSV format for easy analysis
- Metadata headers for export tracking
- Timestamped filenames
- Export tracking (exported by user)
- Large dataset support (up to 10,000 events per export)

**Code References:**
- `lib/audit.ts` - exportEventsCSV function
- Export includes metadata and tracking

**Evidence:**
- Report generation functional
- Reports support on-demand analysis

---

## 4. Related Documents

- Audit and Accountability Policy: `../02-policies-and-procedures/MAC-POL-218_Audit_and_Accountability_Policy.md`
- Audit Log Review Procedure: `../02-policies-and-procedures/MAC-SOP-226_Audit_Log_Review_Procedure.md`
- System Security Plan: `../01-system-scope/MAC-IT-304_System_Security_Plan.md` (Section 7.4, 3.3.6)
- System Control Traceability Matrix: `../04-self-assessment/MAC-AUD-408_System_Control_Traceability_Matrix.md`

---

## 5. Document Control

**Prepared By:** MacTech Solutions Compliance Team  
**Reviewed By:** [To be completed]  
**Approved By:** [To be completed]  
**Next Review Date:** 2026-04-24

**Change History:**
- Version 2.0 (2026-01-24): Complete rewrite with legitimate codebase evidence - CSV export function (lib/audit.ts exportEventsCSV), export API endpoint (app/api/admin/events/export/route.ts), export filtering capabilities, report generation features, and code references
- Version 1.0 (2026-01-24): Initial evidence document creation (placeholder content)

---
