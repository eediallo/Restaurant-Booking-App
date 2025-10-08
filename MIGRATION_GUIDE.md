# Database Migration Guide: SQLite to PostgreSQL (Neon)

This guide explains how to migrate your restaurant booking application from SQLite to PostgreSQL using Neon.

## Prerequisites

1. **Neon Account**: Create a free account at [neon.tech](https://neon.tech)
2. **Existing SQLite Database**: Ensure your `restaurant_booking.db` file exists and contains data
3. **Python Dependencies**: The migration script requires `psycopg2-binary`

## Step 1: Set up Neon Database

1. Go to [Neon Console](https://console.neon.tech)
2. Create a new project
3. Copy your connection string (it looks like):
   ```
   postgresql://username:password@host:port/database
   ```

## Step 2: Set Environment Variable

Export your Neon database URL:

```bash
export NEON_DATABASE_URL="postgresql://username:password@host:port/database"
```

## Step 3: Run Migration

### Option A: Using the helper script (Recommended)

```bash
./migrate.sh
```

This script will:

- Verify prerequisites
- Install required dependencies
- Run the migration
- Verify the results

### Option B: Manual migration

```bash
# Install PostgreSQL driver
pip install psycopg2-binary

# Run migration script
python migrate_to_postgres.py
```

## Step 4: Update Application Configuration

The application automatically detects PostgreSQL when `NEON_DATABASE_URL` is set. For production deployment:

1. **Google Cloud Run**: Set the environment variable in your deployment
2. **Local Development**: Export the variable in your shell
3. **Docker**: Add to your environment variables

```bash
# For production deployment
export NEON_DATABASE_URL="postgresql://username:password@host:port/database"

# Start the application (it will use PostgreSQL)
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## Step 5: Deploy Updated Application

Update your deployment configuration to include the Neon database URL:

### Google Cloud Run

```bash
# Set the environment variable in Cloud Run
gcloud run services update restaurant-booking-api \
  --set-env-vars NEON_DATABASE_URL="postgresql://username:password@host:port/database" \
  --region europe-west1
```

### Docker

```dockerfile
ENV NEON_DATABASE_URL="postgresql://username:password@host:port/database"
```

## Migration Details

The migration script handles:

- ✅ **Table Creation**: Creates all tables in PostgreSQL with correct schema
- ✅ **Data Migration**: Transfers all data while preserving relationships
- ✅ **Sequence Updates**: Properly sets auto-increment sequences
- ✅ **Verification**: Compares row counts between databases

### Migration Order

Tables are migrated in dependency order to respect foreign key constraints:

1. `users`
2. `restaurants`
3. `cancellation_reasons`
4. `customers`
5. `bookings`
6. `restaurant_reviews`

## Troubleshooting

### Common Issues

1. **Connection Error**: Verify your `NEON_DATABASE_URL` is correct
2. **Permission Error**: Ensure your Neon user has create/insert permissions
3. **Data Mismatch**: Check the verification output for row count differences

### Rollback

If you need to rollback:

1. Comment out or remove the `NEON_DATABASE_URL` environment variable
2. The application will automatically fall back to SQLite
3. Restart your application

### Logs

The migration script provides detailed logging:

```bash
python migrate_to_postgres.py 2>&1 | tee migration.log
```

## Production Considerations

1. **Backup**: Always backup your SQLite database before migration
2. **Testing**: Test the migration in a staging environment first
3. **Monitoring**: Monitor your application after switching to PostgreSQL
4. **Performance**: PostgreSQL may have different performance characteristics

## Environment Variables Reference

```bash
# Required for PostgreSQL
NEON_DATABASE_URL=postgresql://username:password@host:port/database

# Optional (will use SQLite if not set)
DATABASE_URL=sqlite:///./restaurant_booking.db

# Other application variables
SECRET_KEY=your-secret-key
DEBUG=False
```

## Verification Commands

After migration, verify your data:

```bash
# Check table counts in SQLite
sqlite3 restaurant_booking.db "SELECT name, COUNT(*) FROM sqlite_master WHERE type='table';"

# Check table counts in PostgreSQL (requires psql)
psql "$NEON_DATABASE_URL" -c "SELECT table_name FROM information_schema.tables WHERE table_schema='public';"
```

## Support

- **Neon Documentation**: [docs.neon.tech](https://docs.neon.tech)
- **Migration Issues**: Check the logs and verify your connection string
- **Application Issues**: Ensure all environment variables are set correctly
