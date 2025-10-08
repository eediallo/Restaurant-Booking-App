#!/usr/bin/env python3
"""
Database Migration Script: SQLite to PostgreSQL

This script migrates all data from the SQLite database to a PostgreSQL database.
It handles the data transfer while preserving relationships and constraints.

Usage:
    python migrate_to_postgres.py

Environment Variables Required:
    NEON_DATABASE_URL - PostgreSQL connection string from Neon
"""

import os
import sys
from typing import List, Dict, Any
from sqlalchemy import create_engine, MetaData, Table, inspect
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.sql import text
import logging
from datetime import datetime

# Add the app directory to the path to import models
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from app.models import Base
from app.database import engine as sqlite_engine

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


class DatabaseMigrator:
    """Handles migration from SQLite to PostgreSQL."""
    
    def __init__(self, postgres_url: str):
        """
        Initialize the migrator with database connections.
        
        Args:
            postgres_url: PostgreSQL connection string
        """
        self.sqlite_engine = sqlite_engine
        self.postgres_engine = create_engine(postgres_url)
        
        # Create session makers
        SqliteSession = sessionmaker(bind=self.sqlite_engine)
        PostgresSession = sessionmaker(bind=self.postgres_engine)
        
        self.sqlite_session = SqliteSession()
        self.postgres_session = PostgresSession()
        
        logger.info("Database connections established")
    
    def create_postgres_tables(self):
        """Create all tables in the PostgreSQL database."""
        logger.info("Creating PostgreSQL tables...")
        try:
            # Drop all tables first (for clean migration)
            Base.metadata.drop_all(bind=self.postgres_engine)
            # Create all tables
            Base.metadata.create_all(bind=self.postgres_engine)
            logger.info("PostgreSQL tables created successfully")
        except Exception as e:
            logger.error(f"Error creating PostgreSQL tables: {e}")
            raise
    
    def get_table_data(self, table_name: str) -> List[Dict[str, Any]]:
        """
        Retrieve all data from a SQLite table.
        
        Args:
            table_name: Name of the table to retrieve data from
            
        Returns:
            List of dictionaries representing table rows
        """
        logger.info(f"Retrieving data from SQLite table: {table_name}")
        
        try:
            # Get table metadata
            metadata = MetaData()
            metadata.reflect(bind=self.sqlite_engine)
            table = metadata.tables[table_name]
            
            # Execute select query
            result = self.sqlite_session.execute(table.select())
            
            # Convert to list of dictionaries
            rows = []
            for row in result:
                row_dict = {}
                for i, column in enumerate(table.columns.keys()):
                    row_dict[column] = row[i]
                rows.append(row_dict)
            
            logger.info(f"Retrieved {len(rows)} rows from {table_name}")
            return rows
            
        except Exception as e:
            logger.error(f"Error retrieving data from {table_name}: {e}")
            raise
    
    def insert_table_data(self, table_name: str, data: List[Dict[str, Any]]):
        """
        Insert data into a PostgreSQL table.
        
        Args:
            table_name: Name of the target table
            data: List of dictionaries representing rows to insert
        """
        if not data:
            logger.info(f"No data to insert for table: {table_name}")
            return
        
        logger.info(f"Inserting {len(data)} rows into PostgreSQL table: {table_name}")
        
        try:
            # Get table metadata
            metadata = MetaData()
            metadata.reflect(bind=self.postgres_engine)
            table = metadata.tables[table_name]
            
            # Insert data in batches
            batch_size = 1000
            for i in range(0, len(data), batch_size):
                batch = data[i:i + batch_size]
                self.postgres_session.execute(table.insert().values(batch))
                self.postgres_session.commit()
                logger.info(f"Inserted batch {i//batch_size + 1} for {table_name}")
            
            logger.info(f"Successfully inserted all data into {table_name}")
            
        except Exception as e:
            logger.error(f"Error inserting data into {table_name}: {e}")
            self.postgres_session.rollback()
            raise
    
    def update_sequences(self):
        """Update PostgreSQL sequences for auto-increment columns."""
        logger.info("Updating PostgreSQL sequences...")
        
        try:
            # Get all tables with their primary key columns
            inspector = inspect(self.postgres_engine)
            tables = inspector.get_table_names()
            
            for table_name in tables:
                # Get primary key columns
                pk_columns = inspector.get_pk_constraint(table_name)
                
                if pk_columns and pk_columns['constrained_columns']:
                    pk_column = pk_columns['constrained_columns'][0]
                    
                    # Check if it's an auto-increment column
                    columns = inspector.get_columns(table_name)
                    pk_col_info = next((col for col in columns if col['name'] == pk_column), None)
                    
                    if pk_col_info and pk_col_info.get('autoincrement', False):
                        # Update sequence
                        sequence_name = f"{table_name}_{pk_column}_seq"
                        max_id_query = text(f"SELECT COALESCE(MAX({pk_column}), 0) FROM {table_name}")
                        max_id = self.postgres_session.execute(max_id_query).scalar()
                        
                        if max_id > 0:
                            update_seq_query = text(f"SELECT setval('{sequence_name}', {max_id})")
                            self.postgres_session.execute(update_seq_query)
                            logger.info(f"Updated sequence {sequence_name} to {max_id}")
            
            self.postgres_session.commit()
            logger.info("Sequences updated successfully")
            
        except Exception as e:
            logger.error(f"Error updating sequences: {e}")
            self.postgres_session.rollback()
            raise
    
    def migrate_data(self):
        """
        Perform the complete data migration.
        
        This method handles the migration in the correct order to respect
        foreign key constraints.
        """
        logger.info("Starting data migration from SQLite to PostgreSQL")
        
        try:
            # Define migration order (respecting foreign key dependencies)
            migration_order = [
                'users',
                'restaurants', 
                'cancellation_reasons',
                'customers',
                'bookings',
                'restaurant_reviews'
            ]
            
            # Get actual table names from SQLite
            inspector = inspect(self.sqlite_engine)
            existing_tables = inspector.get_table_names()
            
            # Filter migration order to only include existing tables
            tables_to_migrate = [table for table in migration_order if table in existing_tables]
            
            logger.info(f"Tables to migrate: {tables_to_migrate}")
            
            # Migrate each table
            for table_name in tables_to_migrate:
                logger.info(f"Migrating table: {table_name}")
                
                # Get data from SQLite
                data = self.get_table_data(table_name)
                
                # Insert data into PostgreSQL
                self.insert_table_data(table_name, data)
            
            # Update sequences for auto-increment columns
            self.update_sequences()
            
            logger.info("Data migration completed successfully!")
            
        except Exception as e:
            logger.error(f"Migration failed: {e}")
            raise
        finally:
            # Close sessions
            self.sqlite_session.close()
            self.postgres_session.close()
    
    def verify_migration(self):
        """Verify that the migration was successful by comparing row counts."""
        logger.info("Verifying migration...")
        
        try:
            sqlite_inspector = inspect(self.sqlite_engine)
            postgres_inspector = inspect(self.postgres_engine)
            
            sqlite_tables = sqlite_inspector.get_table_names()
            postgres_tables = postgres_inspector.get_table_names()
            
            for table_name in sqlite_tables:
                if table_name in postgres_tables:
                    # Count rows in both databases
                    sqlite_count = self.sqlite_session.execute(text(f"SELECT COUNT(*) FROM {table_name}")).scalar()
                    postgres_count = self.postgres_session.execute(text(f"SELECT COUNT(*) FROM {table_name}")).scalar()
                    
                    if sqlite_count == postgres_count:
                        logger.info(f"✓ {table_name}: {sqlite_count} rows (match)")
                    else:
                        logger.error(f"✗ {table_name}: SQLite={sqlite_count}, PostgreSQL={postgres_count} (mismatch)")
            
            logger.info("Migration verification completed")
            
        except Exception as e:
            logger.error(f"Error during verification: {e}")
            raise


def main():
    """Main migration function."""
    # Get PostgreSQL URL from environment
    postgres_url = os.getenv('NEON_DATABASE_URL')
    
    if not postgres_url:
        logger.error("NEON_DATABASE_URL environment variable not set!")
        logger.error("Please set it to your Neon PostgreSQL connection string.")
        logger.error("Example: postgresql://username:password@host:port/database")
        sys.exit(1)
    
    logger.info("Starting SQLite to PostgreSQL migration")
    logger.info(f"Target PostgreSQL URL: {postgres_url.split('@')[0]}@***")
    
    try:
        # Create migrator instance
        migrator = DatabaseMigrator(postgres_url)
        
        # Create PostgreSQL tables
        migrator.create_postgres_tables()
        
        # Migrate data
        migrator.migrate_data()
        
        # Verify migration
        migrator.verify_migration()
        
        logger.info("🎉 Migration completed successfully!")
        
    except Exception as e:
        logger.error(f"Migration failed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()