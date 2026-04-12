#!/bin/bash

# IslandFund Database Setup Script
# Run this after setting up Neon/Supabase PostgreSQL

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "=================================="
echo "IslandFund Database Setup"
echo "=================================="

# Check for required tools
command -v psql >/dev/null 2>&1 || {
    echo -e "${RED}Error: psql is not installed${NC}"
    echo "Install PostgreSQL client:"
    echo "  macOS: brew install postgresql"
    echo "  Ubuntu: apt-get install postgresql-client"
    exit 1
}

# Get connection string
if [ -z "$1" ]; then
    echo -e "${YELLOW}Usage: ./setup-database.sh <connection_string>${NC}"
    echo "Example: ./setup-database.sh postgres://user:password@ep-xxx.region.neon.tech/dbname?sslmode=require"
    exit 1
fi

CONNECTION_STRING="$1"

echo -e "${GREEN}Running database migrations...${NC}"

# Run migrations
psql "$CONNECTION_STRING" -f islandhub_migration.sql

echo ""
echo -e "${GREEN}✅ Database setup complete!${NC}"
echo ""
echo "Next steps:"
echo "  1. Set up Redis at redis.com/cloud"
echo "  2. Configure environment variables in server/.env.production"
echo "  3. Deploy backend to your server"
echo "  4. Deploy frontend to Vercel"
