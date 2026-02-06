#!/bin/bash

# IslandFund Deployment Script
# Usage: ./deploy.sh [production|staging]

set -e

# Configuration
REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE=".env.production"
COMPOSE_FILE="docker-compose.prod.yml"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=================================="
echo "IslandFund Deployment Script"
echo "=================================="

# Check arguments
if [ -z "$1" ]; then
    echo -e "${YELLOW}Usage: ./deploy.sh [production|staging]${NC}"
    exit 1
fi

ENVIRONMENT="$1"

# Determine environment file
if [ "$ENVIRONMENT" == "staging" ]; then
    ENV_FILE=".env.staging"
    COMPOSE_FILE="docker-compose.staging.yml"
fi

echo -e "${GREEN}Deploying to: $ENVIRONMENT${NC}"

# Check if environment file exists
if [ ! -f "$REPO_DIR/server/$ENV_FILE" ]; then
    echo -e "${RED}Error: $ENV_FILE not found in server/ directory${NC}"
    echo "Please copy .env.production.example and fill in the values"
    exit 1
fi

# Pull latest changes
echo -e "${YELLOW}Pulling latest changes...${NC}"
cd "$REPO_DIR"
git pull origin main

# Build Docker images
echo -e "${YELLOW}Building Docker images...${NC}"
docker-compose -f "$COMPOSE_FILE" build

# Stop existing containers
echo -e "${YELLOW}Stopping existing containers...${NC}"
docker-compose -f "$COMPOSE_FILE" down

# Start containers
echo -e "${YELLOW}Starting containers...${NC}"
docker-compose -f "$COMPOSE_FILE" up -d

# Wait for services to be healthy
echo -e "${YELLOW}Waiting for services to be healthy...${NC}"
sleep 10

# Check health
echo -e "${YELLOW}Checking service health...${NC}"

# Check API health
API_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5001/health || echo "000")
if [ "$API_HEALTH" == "200" ]; then
    echo -e "${GREEN}✅ API is healthy${NC}"
else
    echo -e "${RED}❌ API health check failed (HTTP $API_HEALTH)${NC}"
    echo "Checking logs..."
    docker-compose -f "$COMPOSE_FILE" logs server
fi

# Check frontend health
WEB_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 || echo "000")
if [ "$WEB_HEALTH" == "200" ]; then
    echo -e "${GREEN}✅ Frontend is healthy${NC}"
else
    echo -e "${RED}❌ Frontend health check failed (HTTP $WEB_HEALTH)${NC}"
    echo "Checking logs..."
    docker-compose -f "$COMPOSE_FILE" logs web
fi

echo ""
echo "=================================="
echo -e "${GREEN}Deployment complete!${NC}"
echo "=================================="
echo ""
echo "Endpoints:"
echo "  - Frontend: http://localhost:3000"
echo "  - API: http://localhost:5001"
echo "  - Health: http://localhost:5001/health"
echo ""
echo "Useful commands:"
echo "  - View logs: docker-compose -f $COMPOSE_FILE logs -f"
echo "  - Stop: docker-compose -f $COMPOSE_FILE down"
echo "  - Restart: docker-compose -f $COMPOSE_FILE restart"
