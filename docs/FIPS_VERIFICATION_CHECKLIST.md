# FIPS Validation Verification Checklist

**Control:** NIST SP 800-171 Rev. 2, Section 3.13.11 - FIPS-Validated Cryptography  
**Component:** Node.js/OpenSSL JWT Signing  
**Runtime:** Node.js 24.6.0, OpenSSL 3.6.0

---

## Verification Steps

### Step 1: CMVP Database Search

- [ ] Navigate to CMVP Validated Modules Search: https://csrc.nist.gov/projects/cryptographic-module-validation-program/validated-modules/search
- [ ] Search for: **"OpenSSL FIPS Provider"**
- [ ] Filter by: Active certificates
- [ ] Review search results for OpenSSL FIPS Provider modules

**Search Results:**
- Certificate Number: _______________
- Module Name: _______________
- Software Version: _______________
- Validation Date: _______________
- FIPS Level: _______________

---

### Step 2: Verify Software Version Match

- [ ] Compare certificate software version with runtime version (OpenSSL 3.6.0)
- [ ] Confirm version match OR verify version is within validated range
- [ ] Document version comparison results

**Version Verification:**
- Certificate Version: _______________
- Runtime Version: 3.6.0
- Match Status: [ ] Match [ ] Within Range [ ] No Match

**Notes:**
_________________________________________________________________
_________________________________________________________________

---

### Step 3: Verify Operational Environment

- [ ] Review certificate for tested operational environments
- [ ] Identify supported platforms/operating systems
- [ ] Verify Railway platform environment matches certificate requirements
- [ ] Document environment verification

**Environment Verification:**
- Certificate Tested Environments: _______________
- Railway Platform Environment: _______________
- Match Status: [ ] Match [ ] Compatible [ ] No Match

**Notes:**
_________________________________________________________________
_________________________________________________________________

---

### Step 4: Verify FIPS-Approved Mode Configuration

#### 4.1 Configuration Evidence

- [ ] Document OpenSSL FIPS provider configuration
- [ ] Verify FIPS provider is configured in OpenSSL config
- [ ] Document configuration file location and contents
- [ ] Verify Node.js is configured to use FIPS provider

**Configuration Documentation:**
- OpenSSL Config File: _______________
- FIPS Provider Path: _______________
- Configuration Method: _______________

**Configuration Evidence:**
```
[Paste configuration here]
```

---

#### 4.2 Runtime Evidence

- [ ] Verify FIPS provider is loaded at runtime
- [ ] Verify FIPS mode is active
- [ ] Document runtime verification commands and results
- [ ] Capture evidence of FIPS mode operation

**Runtime Verification Commands:**
```bash
# Check OpenSSL version
node -e "console.log('OpenSSL:', process.versions.openssl)"

# Verify FIPS provider (if available)
# [Add FIPS verification commands]
```

**Runtime Verification Results:**
```
[Paste command output here]
```

**FIPS Mode Status:**
- [ ] FIPS Provider Loaded
- [ ] FIPS Mode Active
- [ ] FIPS Algorithms Available
- [ ] JWT Signing Using FIPS-Validated Module

---

## Verification Summary

### Component: Node.js/OpenSSL JWT Signing

**CMVP Certificate Information:**
- Certificate Number: _______________
- Module Name: _______________
- Software Version: _______________
- Validation Date: _______________
- FIPS Level: _______________

**Verification Status:**
- [ ] Software Version: Verified
- [ ] Operational Environment: Verified
- [ ] FIPS-Approved Mode: Verified
- [ ] Overall Status: [ ] FIPS-Validated [ ] Not FIPS-Validated [ ] Requires Migration

**Verification Date:** _______________

**Verified By:** _______________

**Notes:**
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

---

## Next Steps

**If FIPS-Validated:**
- [ ] Update FIPS assessment evidence document
- [ ] Update control implementation status
- [ ] Close POA&M item
- [ ] Document verification evidence

**If Not FIPS-Validated:**
- [ ] Review migration plan options
- [ ] Select migration approach
- [ ] Implement migration or document risk acceptance
- [ ] Update POA&M status

---

## Related Documents

- **FIPS Assessment Evidence:** `compliance/cmmc/level2/05-evidence/MAC-RPT-110_FIPS_Cryptography_Assessment_Evidence.md`
- **FIPS Verification Process:** `docs/FIPS_VERIFICATION_PROCESS.md`
- **FIPS Migration Plan:** `compliance/cmmc/level2/05-evidence/MAC-RPT-124_FIPS_Migration_Plan.md`
