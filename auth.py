"""
Authentication and Role-Based Access Control (RBAC) Module
Using PBKDF2-HMAC-SHA256 for secure password hashing and HMAC-SHA256 for session tokens.
"""

import hashlib
import hmac
import secrets
import json
import base64
import time
from fastapi import Request, HTTPException, Depends, Header
from typing import Optional

SECRET_KEY = "geocde_sd_interactive_media_secret_key_2026_super_safe"
TOKEN_EXPIRY_SECONDS = 3600 * 24 * 7 # 7 days validity

def hash_password(password: str, salt: Optional[str] = None) -> str:
    """Hashes a password with PBKDF2-HMAC-SHA256."""
    if not salt:
        salt = secrets.token_hex(16)
    hashed = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        100000
    ).hex()
    return f"{salt}${hashed}"

def verify_password(stored_hash: str, provided_password: str) -> bool:
    """Verifies a password against the stored salt$hash."""
    try:
        salt, expected_hash = stored_hash.split('$', 1)
        actual_hash = hashlib.pbkdf2_hmac(
            'sha256',
            provided_password.encode('utf-8'),
            salt.encode('utf-8'),
            100000
        ).hex()
        return hmac.compare_digest(expected_hash, actual_hash)
    except Exception:
        return False

def create_access_token(data: dict) -> str:
    """Creates a signed JWT-like base64 token with expiration and HMAC signature."""
    payload = data.copy()
    payload['exp'] = int(time.time()) + TOKEN_EXPIRY_SECONDS
    payload_json = json.dumps(payload, separators=(',', ':'))
    payload_b64 = base64.urlsafe_b64encode(payload_json.encode('utf-8')).decode('utf-8').rstrip('=')
    
    signature = hmac.new(
        SECRET_KEY.encode('utf-8'),
        payload_b64.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()
    
    return f"{payload_b64}.{signature}"

def verify_access_token(token: str) -> Optional[dict]:
    """Verifies the signature and expiration of an access token."""
    try:
        parts = token.split('.')
        if len(parts) != 2:
            return None
        payload_b64, signature = parts
        
        expected_sig = hmac.new(
            SECRET_KEY.encode('utf-8'),
            payload_b64.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
        
        if not hmac.compare_digest(expected_sig, signature):
            return None
        
        # Add padding back if necessary
        rem = len(payload_b64) % 4
        if rem > 0:
            payload_b64 += '=' * (4 - rem)
            
        payload_json = base64.urlsafe_b64decode(payload_b64.encode('utf-8')).decode('utf-8')
        payload = json.loads(payload_json)
        
        if payload.get('exp', 0) < int(time.time()):
            return None # Expired
            
        return payload
    except Exception:
        return None

def get_current_user(request: Request) -> dict:
    """Extracts user from Authorization header or cookie."""
    auth_header = request.headers.get("Authorization")
    token = None
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header[7:].strip()
    elif "access_token" in request.cookies:
        token = request.cookies.get("access_token")
        
    if not token:
        raise HTTPException(status_code=401, detail="Sesi belajar belum aktif. Silakan login terlebih dahulu.")
        
    payload = verify_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Sesi telah kedaluwarsa atau token tidak valid. Silakan login kembali.")
        
    return payload

def require_operator(user: dict = Depends(get_current_user)) -> dict:
    """Ensures the caller has the OPERATOR role."""
    if user.get("role") != "operator":
        raise HTTPException(status_code=403, detail="Akses ditolak: Hanya Operator/Guru yang diizinkan mengakses halaman ini.")
    return user

def require_student(user: dict = Depends(get_current_user)) -> dict:
    """Ensures the caller has the STUDENT role."""
    if user.get("role") != "student":
        raise HTTPException(status_code=403, detail="Akses ditolak: Hanya Siswa yang diizinkan mengakses halaman ini.")
    return user
