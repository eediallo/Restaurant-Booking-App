#!/bin/bash

# Database Migration Helper Script
# This script helps with the SQLite to PostgreSQL migration process

echo "🚀 Restaurant Booking API - Database Migration Helper"
echo "=================================================="

# Check if required environment variables are set
if [ -z "$NEON_DATABASE_URL" ]; then
    echo "❌ Error: NEON_DATABASE_URL environment variable is not set!"
    echo ""
    echo "Please set your Neon PostgreSQL connection string:"
    echo "export NEON_DATABASE_URL='postgresql://username:password@host:port/database'"
    echo ""
    echo "You can get this from your Neon dashboard at https://neon.tech"
    exit 1
fi

echo "✅ NEON_DATABASE_URL is set"
echo "🔗 Target database: ${NEON_DATABASE_URL%%@*}@***"
echo ""

# Install/update dependencies
echo "📦 Installing PostgreSQL dependencies..."
pip install psycopg2-binary

# Check if SQLite database exists
if [ ! -f "restaurant_booking.db" ]; then
    echo "❌ Error: SQLite database 'restaurant_booking.db' not found!"
    echo "Make sure you're running this script from the project root directory."
    exit 1
fi

echo "✅ SQLite database found"

# Run the migration script
echo ""
echo "🔄 Starting migration from SQLite to PostgreSQL..."
echo "This may take a few minutes depending on the amount of data..."
echo ""

python migrate_to_postgres.py

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Migration completed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Set NEON_DATABASE_URL in your production environment"
    echo "2. Update your deployment configuration"
    echo "3. Deploy the updated application"
    echo ""
    echo "To use PostgreSQL locally, run:"
    echo "export NEON_DATABASE_URL='$NEON_DATABASE_URL'"
else
    echo ""
    echo "❌ Migration failed!"
    echo "Check the error messages above and try again."
    exit 1
fi