"""
Authentication utilities for password hashing and JWT token management.
"""

from datetime import datetime, timedelta
from typing import Optional
import bcrypt

# Monkey patch bcrypt to work with passlib
# See: https://github.com/pyca/bcrypt/issues/684
try:
    bcrypt.__about__ = type('about', (object,), {'__version__': bcrypt.__version__})
except AttributeError:
    pass

from jose import JWTError, jwt
from passlib.context import CryptContext
from app.config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES, REFRESH_TOKEN_EXPIRE_DAYS

# Use a simple bcrypt configuration to avoid CI issues
# The key is to use minimal settings and let bcrypt work with defaults
pwd_context = CryptContext(
    schemes=["bcrypt"], 
    deprecated="auto"
)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash a password for storing."""
    # Truncate password to 72 bytes as required by bcrypt
    # This is necessary because bcrypt has a hard limit of 72 bytes
    password_bytes = password.encode('utf-8')
    if len(password_bytes) > 72:
        # Truncate to 72 bytes and decode safely
        password_bytes = password_bytes[:72]
        # Ensure we don't cut in the middle of a multi-byte character
        try:
            password = password_bytes.decode('utf-8')
        except UnicodeDecodeError:
            # If truncation cuts a multi-byte character, trim further
            for i in range(4):  # UTF-8 chars are max 4 bytes
                try:
                    password = password_bytes[:72-i].decode('utf-8')
                    break
                except UnicodeDecodeError:
                    continue
            else:
                # Fallback: use only ASCII part
                password = password_bytes[:72].decode('utf-8', errors='ignore')
    
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a new access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def create_refresh_token(data: dict) -> str:
    """Create a new refresh token."""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def decode_token(token: str) -> Optional[dict]:
    """Decode a JWT token."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None
