# Compliance File Structure Reorganization Plan

**Date:** 2026-01-24  
**Purpose:** Separate FCI-specific compliance documentation from general system security documentation

---

## Current Structure

```
compliance/cmmc/
├── level1/
│   ├── 00-cover-memo/
│   ├── 01-system-scope/          # Mixed: System docs + FCI-specific docs
│   ├── 02-policies-and-procedures/ # Mixed: General policies + FCI-specific
│   ├── 03-control-responsibility/
│   ├── 04-self-assessment/
│   ├── 05-evidence/
│   └── 06-supporting-documents/
```

---

## Proposed Structure

```
compliance/cmmc/
├── system/                         # General system security documentation
│   ├── 00-cover-memo/
│   ├── 01-system-scope/           # System architecture, SSP, general scope
│   ├── 02-policies-and-procedures/ # General security policies
│   ├── 03-control-responsibility/
│   ├── 04-self-assessment/
│   ├── 05-evidence/
│   └── 06-supporting-documents/
│
├── fci/                            # FCI-specific compliance documentation
│   ├── 01-system-scope/           # FCI scope, FCI data handling
│   ├── 02-policies-and-procedures/ # FCI-specific policies, user agreements
│   └── 05-evidence/               # FCI-specific evidence
│
└── level1/                        # Archive/reference (keep for now)
```

---

## Files to Move to FCI Directory

### FCI-Specific System Scope Documents
- `01-system-scope/MAC-SEC-302_FCI_Scope_and_Data_Boundary_Statement.md`
- `01-system-scope/MAC-SEC-303_FCI_Data_Handling_and_Flow_Summary.md`
- `01-system-scope/MAC-IT-105_System_Boundary.md` (FCI-focused sections)

### FCI-Specific Policies/Procedures
- `02-policies-and-procedures/MAC-FRM-203_User_Access_and_FCI_Handling_Acknowledgement.md`
- `02-policies-and-procedures/user-agreements/` (all user agreements mention FCI)

### FCI-Specific Evidence
- Any evidence documents that are FCI-specific (vs general security controls)

---

## Files to Keep in System Directory

### General System Security Documents
- `01-system-scope/MAC-IT-304_System_Security_Plan.md` (general SSP)
- `01-system-scope/MAC-IT-301_System_Description_and_Architecture.md` (general architecture)
- All general security policies (Access Control, Audit, etc.)
- All general evidence (MFA, account lockout, audit logging, etc.)

---

## Implementation Plan

1. Create new directory structure (`system/` and `fci/`)
2. Copy (don't move yet) FCI-specific files to `fci/`
3. Update all references in documents
4. Test that all links still work
5. Move files (remove from level1)
6. Update README and index documents
7. Commit to git

---

## Reference Updates Required

Documents that reference FCI-specific files will need path updates:
- System Security Plan (SSP)
- Evidence Index
- SCTM
- Other cross-referencing documents

---

**Status:** Planning complete, ready for implementation
