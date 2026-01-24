# Operational Evidence Exports - CMMC Level 2

**Purpose:** This directory contains example CSV export structures (redacted) for CMMC Level 2 practices. Evidence is generated on demand directly from the production system at the time of assessment.

## Evidence Files

Example export structures (redacted) are provided to demonstrate the format of operational evidence. All personal data has been redacted for submission. Actual evidence is generated on demand directly from the production system at the time of assessment.

### Available Exports

1. **Physical Access Logs** (`physical-access-logs-*.csv`)
   - Demonstrates PE.L1-3.10.4 implementation
   - Shows date, time, person (redacted), purpose, location
   - Includes retention period and review responsibility evidence

2. **Audit Log** (`audit-log-*.csv`)
   - Demonstrates application event logging
   - Shows login events, admin actions, file operations
   - Includes timestamp, actor (redacted), action type, success status

3. **Endpoint Inventory** (`endpoint-inventory-*.csv`)
   - Demonstrates SI.L1-3.14.2 implementation
   - Shows device identifier, owner (redacted), OS, AV status
   - Includes last verification date and verification method

4. **Users Export** (`users-export-*.csv`)
   - Demonstrates user account management
   - Shows user roles, account status, last login
   - Personal data redacted

## Redaction Process

All exports have been reviewed and redacted to remove:
- Personal names (replaced with "[REDACTED]" or generic identifiers)
- Email addresses (replaced with "[REDACTED]" or generic format)
- IP addresses (replaced with "[REDACTED]" or generic ranges)
- Other personally identifiable information

## Generation Method

Exports are generated on-demand from the live system using:
- Admin UI export functionality, OR
- Evidence generation script: `tsx scripts/generate-evidence.ts`

## Evidence Availability

- **Example export structures:** Provided in this directory (redacted)
- **Operational evidence:** Generated on demand directly from the production system at the time of assessment
- **All exports include:** Metadata headers (timestamp, system identifier, exporting admin username)
- **Database queries:** Can be demonstrated live during assessment

## Related Documents

- Evidence Index: `../evidence-index.md`
- Physical Access Log Procedure: `../templates/physical-access-log-procedure.md`
- Endpoint AV Verification Template: `../templates/endpoint-av-verification-template.md`
