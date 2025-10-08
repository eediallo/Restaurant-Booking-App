"""
Database Configuration and Session Management.

This module sets up the database connection, session management,
and declarative base for the restaurant booking API.
Supports both SQLite (development) and PostgreSQL (production).

Author: AI Assistant
"""

from typing import Generator
import os

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session

# Get database URL from environment variable, fallback to SQLite for development
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./restaurant_booking.db")

# Determine if we're using PostgreSQL or SQLite
is_postgresql = DATABASE_URL.startswith("postgresql://") or DATABASE_URL.startswith("postgres://")

# Create SQLAlchemy engine with appropriate configuration
if is_postgresql:
    # PostgreSQL configuration
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,  # Verify connections before use
        pool_recycle=300,    # Recycle connections every 5 minutes
        echo=False           # Set to True for SQL query logging
    )
    print("Using PostgreSQL database")
else:
    # SQLite configuration  
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},  # Required for SQLite threading
        echo=False           # Set to True for SQL query logging
    )
    print("Using SQLite database")

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create declarative base for all models
Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """
    Database session dependency for FastAPI.

    Creates a new database session for each request and ensures
    it's properly closed after the request completes.

    Yields:
        Session: SQLAlchemy database session

    Example:
        Use as a FastAPI dependency:
        ```python
        @app.get("/example")
        def example_endpoint(db: Session = Depends(get_db)):
            # Use db session here
            pass
        ```
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
