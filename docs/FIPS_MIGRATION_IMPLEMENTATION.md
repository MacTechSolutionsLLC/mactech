# FIPS Migration Implementation Guide

**Control:** NIST SP 800-171 Rev. 2, Section 3.13.11 - FIPS-Validated Cryptography  
**Status:** Migration Required  
**Current:** OpenSSL 3.6.0 (NOT FIPS-validated)  
**Target:** OpenSSL 3.0.8 FIPS Provider (CMVP Certificate #4282)

---

## Current Status

**Verification Results:**
- Runtime: Node.js 24.6.0, OpenSSL 3.6.0
- CMVP Certificate #4282: OpenSSL FIPS Provider 3.0.8 (Validated)
- **Status:** OpenSSL 3.6.0 is NOT FIPS-validated
- **Action Required:** Migration to FIPS-validated version

---

## Migration Options

### Option 1: Railway Platform Node.js Version Control ⚠️ Limited Control

**Approach:** Request Railway to provide Node.js runtime with OpenSSL 3.0.8

**Limitations:**
- Railway controls the Node.js runtime version
- May not support specific OpenSSL versions
- Requires Railway platform support

**Steps:**
1. Contact Railway support to request Node.js runtime with OpenSSL 3.0.8
2. Verify Railway can provide this configuration
3. Update Railway service configuration if available
4. Verify FIPS provider is available and configure FIPS mode
5. Test JWT signing with FIPS provider

**Verification:**
```bash
# After migration, verify OpenSSL version
node -e "console.log('OpenSSL:', process.versions.openssl)"
# Should show: 3.0.8

# Verify FIPS provider (if configured)
# Check OpenSSL configuration for FIPS provider
```

---

### Option 2: Use FIPS-Validated Cryptographic Library ⭐ Recommended Alternative

**Approach:** Replace Node.js crypto module with FIPS-validated library for JWT signing

**Options:**
- **AWS libcrypto (FIPS-validated):** If using AWS services
- **BoringSSL FIPS:** Google's FIPS-validated library
- **WolfSSL FIPS:** Commercial FIPS-validated library

**Implementation Steps:**
1. Research FIPS-validated libraries compatible with Node.js
2. Select library based on compatibility and validation status
3. Integrate library for JWT signing operations
4. Replace Node.js crypto usage with FIPS-validated library
5. Test JWT signing with new library
6. Verify FIPS mode is active

**Code Changes Required:**
- Update JWT signing to use FIPS-validated library
- Maintain compatibility with NextAuth.js
- Update cryptographic operations

**Effort:** Medium-High  
**Timeline:** 6-10 weeks  
**Cost:** Medium (may require commercial library license)

---

### Option 3: Document Risk Acceptance with Compensating Controls

**Approach:** Document risk acceptance if migration is not feasible

**Requirements:**
- Risk assessment completed
- Compensating controls documented
- Business justification provided
- Risk owner approval obtained

**Compensating Controls:**
- Strong encryption algorithms (AES-256, SHA-256)
- Secure key management
- Additional security controls
- Regular security assessments

**Documentation:**
- Risk acceptance document
- Compensating controls evidence
- Business justification
- Risk owner approval

**Effort:** Low  
**Timeline:** 1-2 weeks  
**Cost:** Low

---

## Recommended Approach

**Primary Recommendation:** Option 2 (FIPS-Validated Library)

**Rationale:**
- Railway platform limitations make Option 1 difficult
- Provides direct control over FIPS validation
- Can be implemented without platform changes
- Maintains compliance requirements

**Alternative:** Option 3 (Risk Acceptance) if:
- Migration is not feasible
- Compensating controls are sufficient
- Risk is acceptable to organization

---

## Implementation Steps

### Phase 1: Preparation (Week 1-2)

1. **Research FIPS-Validated Libraries**
   - Identify compatible libraries
   - Verify CMVP validation status
   - Assess integration complexity

2. **Select Library**
   - Evaluate options
   - Select best fit
   - Plan integration

3. **Create Test Environment**
   - Set up test environment
   - Prepare test cases
   - Document test plan

### Phase 2: Implementation (Week 3-6)

1. **Integrate Library**
   - Install library
   - Update JWT signing code
   - Maintain NextAuth.js compatibility

2. **Testing**
   - Unit tests
   - Integration tests
   - FIPS mode verification

3. **Documentation**
   - Update code documentation
   - Update compliance documentation
   - Create operational procedures

### Phase 3: Verification (Week 7-8)

1. **FIPS Mode Verification**
   - Verify FIPS provider is loaded
   - Verify FIPS mode is active
   - Document verification evidence

2. **Compliance Documentation**
   - Update FIPS assessment evidence
   - Update control implementation status
   - Close POA&M item

---

## Verification Requirements

After migration, verify:

1. **Software Version:** Matches CMVP certificate (3.0.8)
2. **Operational Environment:** Matches certificate tested environments
3. **FIPS-Approved Mode:**
   - Configuration evidence
   - Runtime evidence
   - Active FIPS mode verification

**Verification Commands:**
```bash
# Verify OpenSSL version
node -e "console.log('OpenSSL:', process.versions.openssl)"

# Run FIPS verification script
npm run verify:fips

# Check FIPS status via API (admin only)
curl -H "Authorization: Bearer TOKEN" https://your-domain.railway.app/api/admin/fips-status
```

---

## Tools and Scripts

**FIPS Verification Module:**
- `lib/fips-verification.ts` - FIPS status verification
- `scripts/verify-fips-status.ts` - CLI verification script
- `app/api/admin/fips-status/route.ts` - Admin API endpoint

**Usage:**
```bash
# Verify FIPS status
npm run verify:fips

# Check via API (admin)
GET /api/admin/fips-status
```

---

## Related Documents

- **FIPS Migration Plan:** `compliance/cmmc/level2/05-evidence/MAC-RPT-124_FIPS_Migration_Plan.md`
- **FIPS Verification Results:** `docs/OPENSSL_FIPS_VERIFICATION_RESULTS.md`
- **FIPS Verification Checklist:** `docs/FIPS_VERIFICATION_CHECKLIST.md`
- **FIPS Assessment Evidence:** `compliance/cmmc/level2/05-evidence/MAC-RPT-110_FIPS_Cryptography_Assessment_Evidence.md`

---

## Next Steps

1. **Decision:** Select migration approach (Option 2 recommended)
2. **Planning:** Develop detailed implementation plan
3. **Implementation:** Execute migration
4. **Verification:** Verify FIPS mode is active
5. **Documentation:** Update compliance documentation

---

## Notes

- Railway platform controls Node.js runtime, limiting Option 1 feasibility
- Option 2 provides direct control and compliance
- Option 3 may be acceptable with proper risk acceptance documentation
- All options require FIPS mode verification after implementation
