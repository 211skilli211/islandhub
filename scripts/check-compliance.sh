#!/bin/bash
# Vendor Compliance Check Script
# Run this script to check vendor compliance status

# Configuration
API_URL="${API_URL:-http://localhost:5001/api}"
ADMIN_TOKEN="${ADMIN_TOKEN:-}"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "=========================================="
echo "  IslandHub Vendor Compliance Checker"
echo "=========================================="
echo ""

# Check if admin token is provided
if [ -z "$ADMIN_TOKEN" ]; then
    echo -e "${RED}Error: ADMIN_TOKEN not set${NC}"
    echo "Usage: ADMIN_TOKEN=your_token ./check-compliance.sh"
    exit 1
fi

# Get pending compliance reviews
echo -e "${YELLOW}Fetching pending compliance reviews...${NC}"
RESPONSE=$(curl -s -H "Authorization: Bearer $ADMIN_TOKEN" "$API_URL/compliance/admin/pending")

if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to fetch compliance data${NC}"
    exit 1
fi

# Count pending items
PENDING_COUNT=$(echo "$RESPONSE" | grep -o "vendor_id" | wc -l)

if [ "$PENDING_COUNT" -eq 0 ]; then
    echo -e "${GREEN}No pending compliance reviews!${NC}"
    exit 0
fi

echo -e "${YELLOW}Found $PENDING_COUNT pending compliance submissions${NC}"
echo ""

# Display pending items
echo "=========================================="
echo "  Pending Compliance Reviews"
echo "=========================================="
echo "$RESPONSE" | jq -r '.[] | "\(.owner_name) - \(.requirement_name): \(.status)"' 2>/dev/null || echo "$RESPONSE"
echo ""

# Get overall stats
echo "=========================================="
echo "  Compliance Statistics"
echo "=========================================="
TOTAL_REQUIREMENTS=7
echo "Total Requirements: $TOTAL_REQUIREMENTS"
echo ""

# Function to check single vendor
check_vendor() {
    local VENDOR_ID=$1
    echo "Checking Vendor ID: $VENDOR_ID"
    
    SUMMARY=$(curl -s -H "Authorization: Bearer $ADMIN_TOKEN" "$API_URL/compliance/vendor/$VENDOR_ID/summary")
    
    COMPLIANT=$(echo "$SUMMARY" | jq -r '.isCompliant')
    PERCENTAGE=$(echo "$SUMMARY" | jq -r '.percentage')
    APPROVED=$(echo "$SUMMARY" | jq -r '.approved')
    TOTAL=$(echo "$SUMMARY" | jq -r '.total')
    
    if [ "$COMPLIANT" = "true" ]; then
        echo -e "  Status: ${GREEN}COMPLIANT ($PERCENTAGE%)${NC}"
    else
        echo -e "  Status: ${RED}NON-COMPLIANT ($PERCENTAGE%)${NC}"
    fi
    echo "  Approved: $APPROVED / $TOTAL"
    echo ""
}

# Auto-create vendor compliance records for vendors without them
echo -e "${YELLOW}Initializing compliance records for new vendors...${NC}"

# This would typically be done via API, but for now just report
echo "Run migration 046_vendor_compliance.sql first!"
echo ""

# Help message
echo "=========================================="
echo "  Available Commands"
echo "=========================================="
echo "Check pending: curl -H 'Authorization: Bearer \$ADMIN_TOKEN' $API_URL/compliance/admin/pending"
echo "Review item:   curl -X POST -H 'Authorization: Bearer \$ADMIN_TOKEN' -H 'Content-Type: application/json' -d '{\"status\":\"approved\"}' $API_URL/compliance/admin/review/:id"
echo ""

echo "Done!"
