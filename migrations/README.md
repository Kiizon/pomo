# Database Migrations

This folder contains SQL migration files for the PostgreSQL database.

## How to run migrations

Connect to your database and run the SQL files:

```bash
# Run a specific migration
psql $DATABASE_URL -f migrations/friends.sql

# Or connect first, then run
psql $DATABASE_URL
\i migrations/friends.sql
```

## Migrations

- `friends.sql` - Adds friend_requests and friendships tables

