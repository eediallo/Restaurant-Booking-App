"""
Configuration module for loading environment variables.
"""

import os
from dotenv import load_dotenv
import secrets

# Load environment variables from .env file
load_dotenv()

# JWT Configuration
SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    # Generate a random secret key for development/testing
    # In production, this should be set as an environment variable
    SECRET_KEY = secrets.token_urlsafe(32)
    print("WARNING: Using auto-generated SECRET_KEY. Set SECRET_KEY environment variable in production!")

ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))

# Database Configuration
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./restaurant_booking.db")

# Server Configuration
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "8000"))
DEBUG = os.getenv("DEBUG", "True").lower() == "true"

# Validate critical settings (removed strict validation for auto-generated keys)
print(f"SECRET_KEY configured ({len(SECRET_KEY)} characters)")
