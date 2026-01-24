# CMMC Level 2 Current State Analysis

Generated: 2026-01-24T10:08:32.011Z

## Overall Compliance Status

**Total Controls:** 110
**Implemented:** 81 (74%)
**Inherited:** 12 (11%)
**Partially Satisfied:** 0 (0%)
**Not Implemented:** 3 (3%)
**Not Applicable:** 14 (13%)

**Overall Readiness:** 97% (Implemented + Inherited)

## Control Family Breakdown

| Family | Total | Implemented | Inherited | Partially | Not Implemented | Not Applicable | Readiness |
|--------|-------|-------------|-----------|-----------|-----------------|----------------|-----------|
| AC (Access Control) | 22 | 18 | 2 | 0 | 0 | 2 | 100% |
| AT (Awareness and Training) | 3 | 3 | 0 | 0 | 0 | 0 | 100% |
| AU (Audit and Accountability) | 9 | 8 | 1 | 0 | 0 | 0 | 100% |
| CM (Configuration Management) | 9 | 7 | 1 | 0 | 0 | 1 | 100% |
| IA (Identification and Authentication) | 11 | 9 | 0 | 0 | 1 | 1 | 90% |
| IR (Incident Response) | 3 | 3 | 0 | 0 | 0 | 0 | 100% |
| MA (Maintenance) | 6 | 2 | 0 | 0 | 1 | 3 | 67% |
| MP (Media Protection) | 9 | 3 | 2 | 0 | 0 | 4 | 100% |
| PE (Physical Protection) | 6 | 6 | 0 | 0 | 0 | 0 | 100% |
| PS (Personnel Security) | 2 | 2 | 0 | 0 | 0 | 0 | 100% |
| RA (Risk Assessment) | 3 | 3 | 0 | 0 | 0 | 0 | 100% |
| SA (Security Assessment) | 4 | 4 | 0 | 0 | 0 | 0 | 100% |
| SC (System and Communications Protection) | 16 | 6 | 6 | 0 | 1 | 3 | 92% |
| SI (System and Information Integrity) | 7 | 7 | 0 | 0 | 0 | 0 | 100% |

## Key Implementation Features

- ✅ Multi-Factor Authentication (MFA) for privileged accounts
- ✅ Account lockout after failed login attempts
- ✅ Comprehensive audit logging with 90-day retention
- ✅ CUI file storage and protection with password protection
- ✅ Separation of duties with role-based access control
- ✅ POA&M tracking and management system

## Controls Requiring Attention

| Control ID | Requirement | Status |
|-----------|-------------|--------|
| 3.5.6 | Disable identifiers after inactivity... | ❌ not_implemented |
| 3.7.2 | Controls on maintenance tools... | ❌ not_implemented |
| 3.13.11 | FIPS-validated cryptography... | ❌ not_implemented |
