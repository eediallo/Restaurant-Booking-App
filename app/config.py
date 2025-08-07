"""
Configuration module for loading environment variables.
"""

import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# JWT Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "fallback-secret-key-change-this")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))

# Database Configuration
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./restaurant_booking.db")

# Server Configuration
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "8000"))
DEBUG = os.getenv("DEBUG", "True").lower() == "true"

# Validate critical settings
if SECRET_KEY == "fallback-secret-key-change-this":
    raise ValueError("SECRET_KEY must be set in environment variables")

if len(SECRET_KEY) < 32:
    raise ValueError("SECRET_KEY must be at least 32 characters long for security")
