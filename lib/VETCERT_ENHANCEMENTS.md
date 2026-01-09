# VetCert-Enabled Contract Discovery Enhancements

This document describes the VetCert-eligible SDVOSB/VOSB filtering enhancements added to the contract discovery system.

## Overview

The contract discovery system has been augmented to reliably catch **VetCert-eligible (SBA-certified) SDVOSB/VOSB** opportunities, especially those in **cybersecurity/RMF** domains.

## Key Features

### 1. VetCert Set-Aside Phrase Detection

The system now recognizes exact phrases used in solicitations:

**Government-wide (FAR 19.14):**
- "Service-Disabled Veteran-Owned Small Business (SDVOSB) Set-Aside"
- "Service-Disabled Veteran-Owned Small Business (SDVOSB) Sole Source"

**VA "Veterans First" (VA-specific):**
- "Veteran-Owned Small Business Set Aside, Department of Veterans Affairs"
- "Veteran-Owned Small Business Sole Source, Department of Veterans Affairs"

**Certification Language:**
- "SBA certified SDVOSB/VOSB"
- "listed in SBA certification database"
- "Veteran Small Business Certification Program (VetCert)"
- "13 CFR Part 128"
- "veterans.certify.sba.gov"

### 2. Cyber/RMF NAICS Codes

Automatically filters for common cyber/RMF NAICS codes:
- **541512** – Computer Systems Design Services
- **541519** – Other Computer Related Services
- **541511** – Custom Computer Programming Services

### 3. PSC Codes for RMF/Cyber Consulting

Targets PSC codes that frequently capture RMF/cyber work:
- **D310** — IT & Telecom: Cyber Security and Data Backup
- **D307** — IT & Telecom: IT Strategy and Architecture
- **D399** — IT & Telecom: Other IT and Telecommunications

### 4. RMF Role & Artifact Keywords

Detects opportunities requiring specific RMF expertise:

**Roles:**
- ISSO (Information System Security Officer)
- ISSM (Information System Security Manager)
- ISSE (Information System Security Engineer)
- SCA (Security Control Assessor)

**Artifacts:**
- eMASS (Enterprise Mission Assurance Support Service)
- ATO (Authorization to Operate)
- SSP (System Security Plan)
- SAP (Security Assessment Plan)
- SAR (Security Assessment Report)
- POA&M (Plan of Action and Milestones)
- NIST 800-53
- Continuous monitoring
- Control assessment

### 5. GSA MAS HACS SIN Support

Recognizes GSA MAS HACS (Highly Adaptive Cybersecurity Services) opportunities:
- **54151HACS** – Explicitly includes RMF services

## Relevance Scoring Enhancements

The relevance scoring algorithm now provides significant boosts for:

1. **VetCert-eligible opportunities**: +15 points
2. **RMF roles mentioned**: +8 points
3. **RMF artifacts mentioned**: +5 points
4. **Cyber/RMF NAICS codes**: +5 points
5. **PSC codes (D310, D307, D399)**: +3 points
6. **GSA HACS**: +5 points

This ensures VetCert-eligible cyber/RMF opportunities are prioritized in search results.

## Search Templates

The UI includes 11 optimized search templates for VetCert opportunities:

1. **VetCert SDVOSB Set-Asides (Cyber/RMF)**
2. **VetCert SDVOSB Sole Source (Cyber/RMF)**
3. **VA Veterans First VOSB (Cyber/RMF)**
4. **VetCert RMF Roles (ISSO/ISSM/ISSE)**
5. **VetCert eMASS & ATO Support**
6. **VetCert NIST 800-53 & Control Assessment**
7. **VetCert Cyber NAICS (541512/541519/541511)**
8. **GSA HACS VetCert Opportunities**
9. **VetCert PSC D310 (Cyber Security)**
10. **VetCert PSC D307 (IT Strategy/Architecture)**
11. **Veteran-Owned Set-Asides (General)**

## Helper Functions

### `buildVetCertCyberQuery(options)`

Builds optimized VetCert-eligible queries with customizable options:

```typescript
buildVetCertCyberQuery({
  setAsideType: 'SDVOSB' | 'VOSB' | 'both',
  includeSoleSource: boolean,
  includeRmfRoles: boolean,
  includeRmfArtifacts: boolean,
  naicsCodes: string[],
  location?: string,
  agency?: string[]
})
```

## Exported Constants

The following constants are exported for use in other modules:

- `VETCERT_SET_ASIDE_PHRASES` - Exact phrases to target
- `VETCERT_VARIANTS` - Abbreviations and variants
- `CYBER_RMF_NAICS_CODES` - Cyber/RMF NAICS codes
- `RMF_CYBER_PSC_CODES` - PSC codes for RMF/cyber
- `RMF_ROLE_KEYWORDS` - RMF role keywords
- `RMF_ARTIFACT_KEYWORDS` - RMF artifact keywords
- `GSA_HACS_SIN` - GSA HACS SIN code

## Usage

The enhancements are automatically applied to all contract discovery searches. The system will:

1. Detect VetCert-eligible language in search results
2. Extract and tag VetCert-related keywords
3. Boost relevance scores for VetCert opportunities
4. Provide optimized search templates in the UI

No additional configuration is required - the enhancements work out of the box with existing search functionality.

