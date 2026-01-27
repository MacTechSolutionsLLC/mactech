# CUI Vault GET Endpoint Deployment Guide

**Date:** 2026-01-27  
**Purpose:** Add GET endpoint to CUI vault API for retrieving files

---

## Overview

The CUI vault API currently only has a `POST /cui/store` endpoint. This guide provides instructions for adding a `GET /cui/{record_id}` endpoint to retrieve and decrypt files.

---

## Prerequisites

- Access to CUI vault VM (SSH)
- Vault API source code at `/opt/cui-vault/app.py`
- Python `cryptography` library installed
- PostgreSQL database access configured
- Environment variables set (encryption key, API key, database credentials)

---

## Implementation Steps

### Step 1: Review Existing Code

1. **SSH into the CUI vault VM:**
   ```bash
   ssh patrick@cui-vault-jamy
   ```

2. **Navigate to vault directory:**
   ```bash
   cd /opt/cui-vault
   ```

3. **Review existing `app.py`:**
   ```bash
   cat app.py
   ```

4. **Identify:**
   - Framework used (FastAPI or Flask)
   - Database connection pattern
   - Encryption key environment variable name
   - API key authentication pattern
   - Import statements structure

### Step 2: Add GET Endpoint

1. **Open `app.py` for editing:**
   ```bash
   sudo nano app.py
   # or
   sudo vi app.py
   ```

2. **Add the GET endpoint function** (see `vault-api-get-endpoint.py` in workspace root for reference implementation)

3. **Key points to adjust:**
   - Match the framework (FastAPI vs Flask)
   - Use the same database connection function as the store endpoint
   - Use the same encryption key environment variable name
   - Use the same API key validation pattern

### Step 3: Handle Metadata (Optional Enhancement)

**Current Issue:** The reference implementation returns placeholder values for `filename` and `mimeType` because the database schema doesn't currently store this metadata.

**Options:**

**Option A: Store metadata in database (Recommended)**
- Add `filename` and `mimeType` columns to `cui_records` table
- Update store endpoint to save metadata
- Update GET endpoint to retrieve metadata

**Option B: Return placeholders (Quick fix)**
- Use placeholder values as in reference implementation
- Client library will use fallback values
- Works for basic functionality

**Option C: Store metadata in separate table**
- Create `cui_metadata` table with foreign key to `cui_records`
- More flexible but requires schema changes

**For now:** The reference implementation uses Option B (placeholders). You can enhance it later.

### Step 4: Test the Endpoint

1. **Restart the vault service:**
   ```bash
   sudo systemctl restart cuivault
   # or whatever your service name is
   ```

2. **Check service status:**
   ```bash
   sudo systemctl status cuivault
   ```

3. **Test the endpoint:**
   ```bash
   # Test with existing record ID
   curl -s https://vault.mactechsolutionsllc.com/cui/c4c23b45-8a82-494b-ad15-292c8dafcc22 \
     -H "X-VAULT-KEY: 77564883c27638b3dd8b969b6304ef6106d9dd676cf2b5f4956564bb603559fd" \
     | jq .
   ```

4. **Verify response format:**
   ```json
   {
     "id": "c4c23b45-8a82-494b-ad15-292c8dafcc22",
     "data": "base64-encoded-content...",
     "filename": "file",
     "mimeType": "application/octet-stream",
     "size": 23323,
     "created_at": "2026-01-27T07:38:34.572649+00:00"
   }
   ```

5. **Decode and verify file content:**
   ```bash
   curl -s https://vault.mactechsolutionsllc.com/cui/c4c23b45-8a82-494b-ad15-292c8dafcc22 \
     -H "X-VAULT-KEY: 77564883c27638b3dd8b969b6304ef6106d9dd676cf2b5f4956564bb603559fd" \
     | jq -r '.data' | base64 -d > retrieved-file.csv
   
   # Verify file
   head retrieved-file.csv
   ```

### Step 5: Test Error Cases

1. **Test invalid API key:**
   ```bash
   curl -s https://vault.mactechsolutionsllc.com/cui/c4c23b45-8a82-494b-ad15-292c8dafcc22 \
     -H "X-VAULT-KEY: invalid-key" \
     | jq .
   # Expected: {"detail": "Unauthorized"} with 401 status
   ```

2. **Test missing API key:**
   ```bash
   curl -s https://vault.mactechsolutionsllc.com/cui/c4c23b45-8a82-494b-ad15-292c8dafcc22 \
     | jq .
   # Expected: {"detail": "Unauthorized"} with 401 status
   ```

3. **Test non-existent record:**
   ```bash
   curl -s https://vault.mactechsolutionsllc.com/cui/00000000-0000-0000-0000-000000000000 \
     -H "X-VAULT-KEY: 77564883c27638b3dd8b969b6304ef6106d9dd676cf2b5f4956564bb603559fd" \
     | jq .
   # Expected: {"detail": "Not Found"} with 404 status
   ```

### Step 6: Test Integration with Main Application

1. **Upload a test CUI file** from the main application UI

2. **Verify file is stored in vault:**
   ```bash
   sudo -u postgres psql cuivault -c "SELECT id, created_at FROM public.cui_records ORDER BY created_at DESC LIMIT 1;"
   ```

3. **Retrieve the file** from the main application UI (should work now)

4. **Check application logs** for any errors

---

## Reference Implementation

See `vault-api-get-endpoint.py` in the workspace root for:
- FastAPI implementation
- Flask implementation (commented)
- Error handling
- Database query pattern
- Decryption logic

---

## Troubleshooting

### Issue: "Module not found" error
**Solution:** Ensure `cryptography` library is installed:
```bash
pip3 install cryptography
# or if using virtual environment
source .venv/bin/activate
pip install cryptography
```

### Issue: "Database connection failed"
**Solution:** Verify database credentials in environment variables:
```bash
echo $DB_NAME
echo $DB_USER
echo $DB_PASSWORD
echo $DB_HOST
```

### Issue: "Decryption failed"
**Solution:** Verify encryption key matches the one used for storage:
```bash
echo $CUI_ENCRYPTION_KEY
# Should match the key used in store endpoint
```

### Issue: Service won't start
**Solution:** Check service logs:
```bash
sudo journalctl -u cuivault -n 50 --no-pager
```

### Issue: "Invalid record ID format"
**Solution:** Ensure UUID format is correct (with hyphens):
- Correct: `c4c23b45-8a82-494b-ad15-292c8dafcc22`
- Incorrect: `c4c23b458a82494bad15292c8dafcc22`

---

## Security Notes

- API key authentication is required for all requests
- Data is decrypted on-demand (remains encrypted in database)
- All communication over HTTPS/TLS 1.3
- Error messages don't expose sensitive information
- Database connection uses localhost only

---

## Next Steps (Optional Enhancements)

1. **Store metadata in database:**
   - Add `filename` and `mimeType` columns to `cui_records` table
   - Update store endpoint to save metadata
   - Update GET endpoint to return actual metadata

2. **Add list endpoint:**
   - Implement `GET /cui/list` to list all records
   - Useful for administrative purposes

3. **Add delete endpoint:**
   - Implement `DELETE /cui/{record_id}` to delete records
   - Consider logical deletion vs physical deletion

4. **Add metadata endpoint:**
   - Implement `GET /cui/{record_id}/metadata` to get metadata without decrypting

---

## Verification Checklist

- [ ] GET endpoint added to `app.py`
- [ ] Service restarts without errors
- [ ] Endpoint returns 401 for invalid API key
- [ ] Endpoint returns 404 for non-existent record
- [ ] Endpoint returns 200 with correct data for valid record
- [ ] Decrypted file content matches original
- [ ] Integration with main application works
- [ ] Error handling works correctly

---

## Support

If you encounter issues:
1. Check service logs: `sudo journalctl -u cuivault -f`
2. Verify environment variables are set correctly
3. Test database connection independently
4. Verify encryption key matches store endpoint
5. Check network connectivity and firewall rules
