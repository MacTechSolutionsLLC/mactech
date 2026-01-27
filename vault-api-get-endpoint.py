"""
CUI Vault API - GET Endpoint Implementation
Reference implementation for adding GET /cui/{record_id} endpoint

This code should be added to /opt/cui-vault/app.py on the CUI vault VM.
Adjust imports and framework-specific syntax based on your actual implementation.
"""

# Example implementation for FastAPI (adjust if using Flask)
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
import psycopg2
import os
import base64
import uuid
from datetime import datetime

# Database connection function (adjust based on your existing implementation)
def get_db_connection():
    """Get PostgreSQL database connection"""
    return psycopg2.connect(
        dbname=os.getenv("DB_NAME", "cuivault"),
        user=os.getenv("DB_USER", "cuivault_user"),
        password=os.getenv("DB_PASSWORD"),
        host=os.getenv("DB_HOST", "localhost"),
        port=os.getenv("DB_PORT", "5432")
    )

# Encryption key (should match the one used in store endpoint)
def get_encryption_key():
    """Get encryption key from environment variable"""
    key_hex = os.getenv("CUI_ENCRYPTION_KEY")
    if not key_hex:
        raise ValueError("CUI_ENCRYPTION_KEY environment variable not set")
    return bytes.fromhex(key_hex)

@app.get("/cui/{record_id}")
async def get_cui(record_id: str, request: Request):
    """
    Retrieve and decrypt a CUI file by record ID
    
    Args:
        record_id: UUID of the CUI record to retrieve
        request: FastAPI request object (for headers)
    
    Returns:
        JSON response with decrypted file data:
        {
            "id": "uuid",
            "data": "base64-encoded-file-content",
            "filename": "original-filename.ext",
            "mimeType": "text/csv",
            "size": 23323,
            "created_at": "2026-01-27T07:38:34.572649+00:00"
        }
    
    Errors:
        401: Unauthorized (invalid or missing API key)
        404: Not Found (record ID doesn't exist)
        500: Internal Server Error (decryption or database error)
    """
    # 1. Authenticate API key
    api_key = request.headers.get("X-VAULT-KEY")
    expected_key = os.getenv("VAULT_API_KEY")
    
    if not api_key or api_key != expected_key:
        return JSONResponse(
            {"detail": "Unauthorized"},
            status_code=401
        )
    
    # 2. Validate UUID format
    try:
        uuid.UUID(record_id)
    except ValueError:
        return JSONResponse(
            {"detail": "Invalid record ID format"},
            status_code=400
        )
    
    # 3. Query database
    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Query for the record
        cur.execute(
            """
            SELECT id, ciphertext, nonce, tag, created_at
            FROM public.cui_records
            WHERE id = %s
            """,
            (record_id,)
        )
        
        row = cur.fetchone()
        cur.close()
        
        if not row:
            return JSONResponse(
                {"detail": "Not Found"},
                status_code=404
            )
        
        record_id_db, ciphertext, nonce, tag, created_at = row
        
        # 4. Decrypt data
        try:
            encryption_key = get_encryption_key()
            aesgcm = AESGCM(encryption_key)
            
            # AES-GCM requires tag to be appended to ciphertext for decryption
            ciphertext_with_tag = ciphertext + tag
            
            # Decrypt
            plaintext = aesgcm.decrypt(nonce, ciphertext_with_tag, None)
            
        except Exception as e:
            # Log error but don't expose details
            print(f"Decryption error for record {record_id}: {str(e)}")
            return JSONResponse(
                {"detail": "Internal Server Error"},
                status_code=500
            )
        
        # 5. Encode decrypted data as base64
        base64_data = base64.b64encode(plaintext).decode('utf-8')
        
        # 6. Get file size
        file_size = len(plaintext)
        
        # 7. Format created_at timestamp
        if isinstance(created_at, datetime):
            created_at_iso = created_at.isoformat()
        else:
            created_at_iso = str(created_at)
        
        # 8. Return JSON response
        # Note: If metadata (filename, mimeType) was stored during upload,
        # you may need to add a metadata field to the database schema
        # For now, we'll return what we have
        return JSONResponse({
            "id": str(record_id_db),
            "data": base64_data,
            "filename": "file",  # TODO: Retrieve from metadata if stored
            "mimeType": "application/octet-stream",  # TODO: Retrieve from metadata if stored
            "size": file_size,
            "created_at": created_at_iso
        })
        
    except psycopg2.Error as e:
        # Database error
        print(f"Database error: {str(e)}")
        return JSONResponse(
            {"detail": "Internal Server Error"},
            status_code=500
        )
    except Exception as e:
        # Unexpected error
        print(f"Unexpected error: {str(e)}")
        return JSONResponse(
            {"detail": "Internal Server Error"},
            status_code=500
        )
    finally:
        if conn:
            conn.close()


# Alternative implementation for Flask (if using Flask instead of FastAPI)
"""
from flask import Flask, request, jsonify
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
import psycopg2
import os
import base64
import uuid

@app.route('/cui/<record_id>', methods=['GET'])
def get_cui(record_id):
    # 1. Authenticate API key
    api_key = request.headers.get('X-VAULT-KEY')
    expected_key = os.getenv('VAULT_API_KEY')
    
    if not api_key or api_key != expected_key:
        return jsonify({"detail": "Unauthorized"}), 401
    
    # 2. Validate UUID format
    try:
        uuid.UUID(record_id)
    except ValueError:
        return jsonify({"detail": "Invalid record ID format"}), 400
    
    # 3. Query database
    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute(
            "SELECT id, ciphertext, nonce, tag, created_at FROM public.cui_records WHERE id = %s",
            (record_id,)
        )
        
        row = cur.fetchone()
        cur.close()
        
        if not row:
            return jsonify({"detail": "Not Found"}), 404
        
        record_id_db, ciphertext, nonce, tag, created_at = row
        
        # 4. Decrypt data
        try:
            encryption_key = get_encryption_key()
            aesgcm = AESGCM(encryption_key)
            ciphertext_with_tag = ciphertext + tag
            plaintext = aesgcm.decrypt(nonce, ciphertext_with_tag, None)
        except Exception as e:
            print(f"Decryption error: {str(e)}")
            return jsonify({"detail": "Internal Server Error"}), 500
        
        # 5. Return response
        return jsonify({
            "id": str(record_id_db),
            "data": base64.b64encode(plaintext).decode('utf-8'),
            "filename": "file",
            "mimeType": "application/octet-stream",
            "size": len(plaintext),
            "created_at": created_at.isoformat() if hasattr(created_at, 'isoformat') else str(created_at)
        })
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"detail": "Internal Server Error"}), 500
    finally:
        if conn:
            conn.close()
"""
