# FIPS Migration Option 2: Implementation Guide

**Migration Approach:** FIPS-Validated Cryptographic Library  
**Status:** ✅ Implemented  
**Implementation Date:** 2026-01-25

---

## Implementation Summary

Option 2 has been implemented using a FIPS-validated cryptography wrapper that:
1. Provides FIPS-validated JWT encoding/decoding
2. Integrates with NextAuth.js via custom JWT configuration
3. Verifies FIPS status before operations
4. Falls back gracefully when FIPS mode is not available

---

## Implementation Details

### Files Created

1. **`lib/fips-crypto.ts`**
   - FIPS-validated cryptography wrapper
   - HMAC operations using FIPS crypto
   - FIPS status checking functions

2. **`lib/fips-jwt.ts`**
   - Custom JWT encoder/decoder using FIPS-validated crypto
   - JWT signing and verification with FIPS validation
   - Base64URL encoding/decoding for JWT format

3. **`lib/fips-nextauth-config.ts`**
   - NextAuth.js integration for FIPS-validated JWT
   - Custom JWT encode/decode functions
   - Configuration helper for NextAuth

### Files Modified

1. **`lib/auth.ts`**
   - Added FIPS JWT configuration to NextAuth
   - Uses `getFIPSJWTConfig()` for JWT operations

---

## How It Works

### FIPS-Validated JWT Flow

1. **JWT Encoding (Sign In):**
   - NextAuth calls custom `encode` function
   - Function uses `encodeFIPSJWT()` from `fips-jwt.ts`
   - JWT signed using FIPS-validated HMAC-SHA256
   - Returns standard JWT format

2. **JWT Decoding (Session Validation):**
   - NextAuth calls custom `decode` function
   - Function uses `decodeFIPSJWT()` from `fips-jwt.ts`
   - JWT signature verified using FIPS-validated crypto
   - Returns decoded payload if valid

3. **FIPS Status Verification:**
   - Before JWT operations, FIPS status is checked
   - Warns if FIPS mode is not active
   - Continues operation (with warning) for graceful degradation

---

## FIPS Mode Configuration

### Current Status

**Runtime:** Node.js 24.6.0, OpenSSL 3.6.0  
**FIPS Status:** Not Active (OpenSSL 3.6.0 not validated)  
**Target:** OpenSSL 3.0.8 FIPS Provider (CMVP Certificate #4282)

### To Activate FIPS Mode

**Option A: Railway Platform Configuration**
1. Contact Railway support to request Node.js runtime with OpenSSL 3.0.8
2. Configure OpenSSL 3.0.8 FIPS provider
3. Verify FIPS mode is active

**Option B: OpenSSL FIPS Provider Configuration**
1. Ensure OpenSSL 3.0.8 is available
2. Configure OpenSSL to load FIPS provider
3. Verify FIPS provider is active at runtime

**Verification:**
```bash
# Check OpenSSL version
node -e "console.log('OpenSSL:', process.versions.openssl)"

# Verify FIPS status
npm run verify:fips

# Check via API
curl -H "Authorization: Bearer TOKEN" \
  https://your-domain.railway.app/api/admin/fips-status
```

---

## Compliance Status

### Current Implementation

✅ **Code Implementation:** Complete
- FIPS-validated JWT encoding/decoding implemented
- NextAuth.js integration complete
- FIPS status verification in place

⚠️ **FIPS Mode:** Not Active
- OpenSSL 3.6.0 is not FIPS-validated
- Migration to OpenSSL 3.0.8 FIPS Provider required
- Code is ready for FIPS mode when available

### To Achieve Full Compliance

1. **Migrate to OpenSSL 3.0.8 FIPS Provider**
   - Railway platform: Request Node.js with OpenSSL 3.0.8
   - Or: Configure OpenSSL 3.0.8 FIPS provider manually

2. **Verify FIPS Mode is Active**
   - Run `npm run verify:fips`
   - Check FIPS status API
   - Verify CMVP certificate matches

3. **Document FIPS Mode Evidence**
   - Configuration evidence
   - Runtime verification evidence
   - CMVP certificate information

---

## Testing

### Test FIPS JWT Operations

```typescript
import { encodeFIPSJWT, decodeFIPSJWT } from '@/lib/fips-jwt'

// Test encoding
const payload = { userId: '123', role: 'ADMIN' }
const secret = 'test-secret'
const token = encodeFIPSJWT(payload, secret)

// Test decoding
const decoded = decodeFIPSJWT(token, secret)
console.log('Decoded:', decoded)
```

### Test NextAuth Integration

1. Sign in to the application
2. Check JWT token in browser cookies
3. Verify token can be decoded
4. Check FIPS status warnings in logs

---

## Monitoring

### FIPS Status Monitoring

**API Endpoint:** `GET /api/admin/fips-status` (ADMIN only)

**Response:**
```json
{
  "success": true,
  "verification": {
    "opensslVersion": "3.6.0",
    "validationStatus": "not-validated",
    "fipsModeActive": false
  },
  "compliance": {
    "status": "non-compliant",
    "actionRequired": true
  }
}
```

### Log Monitoring

Check application logs for FIPS warnings:
- `FIPS JWT Warning:` - Indicates FIPS mode not active
- `FIPS mode not active` - Migration required

---

## Next Steps

1. **Contact Railway Support**
   - Request Node.js runtime with OpenSSL 3.0.8
   - Verify Railway can provide this configuration

2. **Alternative: Configure OpenSSL 3.0.8 FIPS Provider**
   - If Railway cannot provide OpenSSL 3.0.8
   - Configure FIPS provider manually
   - Verify FIPS mode activation

3. **Verify FIPS Mode**
   - Run verification script
   - Check FIPS status API
   - Document verification evidence

4. **Update Compliance Documentation**
   - Update FIPS assessment evidence
   - Document FIPS mode configuration
   - Update control implementation status

---

## Related Documents

- **FIPS Migration Plan:** `../MAC-RPT-124_FIPS_Migration_Plan.md`
- **FIPS Verification Results:** `FIPS_VERIFICATION_RESULTS.md`
- **FIPS Verification Checklist:** `../../../docs/FIPS_VERIFICATION_CHECKLIST.md`
- **FIPS Assessment Evidence:** `../MAC-RPT-110_FIPS_Cryptography_Assessment_Evidence.md`
- **OpenSSL FIPS Verification Results:** `../../../docs/OPENSSL_FIPS_VERIFICATION_RESULTS.md`

---

## Notes

- Code implementation is complete and ready for FIPS mode
- FIPS mode activation requires OpenSSL 3.0.8 FIPS Provider
- Railway platform configuration may be required
- Monitoring and verification tools are in place
- Compliance documentation will be updated once FIPS mode is active
