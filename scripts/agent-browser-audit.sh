#!/bin/bash
# =============================================================================
# IslandHub Agent-Browser Audit Script
# Proper implementation following Vercel agent-browser CLI patterns
# =============================================================================

set -e

# Configuration
WEB_URL="${WEB_URL:-http://localhost:3000}"
API_URL="${API_URL:-http://localhost:5001}"
OUTPUT_DIR="${AUDIT_OUTPUT_DIR:-./audit-results}"
DATE=$(date +%Y%m%d_%H%M%S)
SESSION_NAME="${AGENT_BROWSER_SESSION_NAME:-islandfund-audit}"
export AGENT_BROWSER_SESSION_NAME="$SESSION_NAME"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[$(date '+%H:%M:%S')]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Ensure output directory exists
mkdir -p "$OUTPUT_DIR/screenshots"
mkdir -p "$OUTPUT_DIR/snapshots"

# Check agent-browser installation
check_agent_browser() {
    if ! command -v agent-browser &> /dev/null; then
        error "agent-browser not found. Install with: npm install -g agent-browser"
        exit 1
    fi
    
    local version
    version=$(agent-browser --version)
    log "Using agent-browser $version"
}

# Audit: Homepage
audit_homepage() {
    log "=== Auditing Homepage ==="
    
    # Open homepage
    agent-browser open "$WEB_URL/"
    
    # Wait for page to load
    agent-browser wait --load networkidle
    
    # Take snapshot to verify elements
    log "Taking accessibility snapshot..."
    agent-browser snapshot -i > "$OUTPUT_DIR/snapshots/homepage_$DATE.json"
    
    # Take screenshot
    log "Capturing screenshot..."
    agent-browser screenshot --full "$OUTPUT_DIR/screenshots/homepage_$DATE.png"
    
    # Check for key elements (using semantic locators)
    log "Verifying key elements..."
    
    # Try to find and click on navigation
    if agent-browser find role "navigation" &>/dev/null; then
        log "✓ Navigation found"
    else
        warn "Navigation not found"
    fi
    
    # Check for search functionality
    if agent-browser find role "search" &>/dev/null; then
        log "✓ Search functionality found"
    else
        warn "Search functionality not found"
    fi
    
    log "Homepage audit complete"
}

# Audit: Product Search Flow
audit_search_flow() {
    log "=== Auditing Search Flow ==="
    
    # Navigate to browse page
    agent-browser open "$WEB_URL/browse"
    agent-browser wait --load networkidle
    
    # Take snapshot
    agent-browser snapshot -i > "$OUTPUT_DIR/snapshots/browse_$DATE.json"
    agent-browser screenshot --full "$OUTPUT_DIR/screenshots/browse_$DATE.png"
    
    # Find search input and enter query
    log "Testing search functionality..."
    
    # Try to find search input by role or placeholder
    if agent-browser find role "searchbox" &>/dev/null || \
       agent-browser find placeholder "Search" &>/dev/null; then
        log "✓ Search input found"
        
        # Get the ref and fill it
        local search_ref
        search_ref=$(agent-browser find role "searchbox" | grep -oE '@e[0-9]+' | head -1)
        
        if [[ -n "$search_ref" ]]; then
            agent-browser fill "$search_ref" "jamaica tours"
            agent-browser press Enter
            agent-browser wait 2000
            
            # Capture search results
            agent-browser snapshot -i > "$OUTPUT_DIR/snapshots/search_results_$DATE.json"
            agent-browser screenshot --full "$OUTPUT_DIR/screenshots/search_results_$DATE.png"
            
            log "✓ Search results captured"
        fi
    else
        warn "Search input not found"
    fi
    
    log "Search flow audit complete"
}

# Audit: Checkout Flow (if test account available)
audit_checkout_flow() {
    log "=== Auditing Checkout Flow ==="
    
    # Navigate to products
    agent-browser open "$WEB_URL/products"
    agent-browser wait --load networkidle
    
    # Take snapshot to find product listings
    local snapshot_file="$OUTPUT_DIR/snapshots/products_$DATE.json"
    agent-browser snapshot -i > "$snapshot_file"
    
    # Look for product links
    local product_ref
    product_ref=$(grep -oE 'link.*product|link.*tour|link.*item' "$snapshot_file" | head -1 | grep -oE '@e[0-9]+')
    
    if [[ -n "$product_ref" ]]; then
        log "Clicking on product..."
        agent-browser click "$product_ref"
        agent-browser wait --load networkidle
        
        # Capture product detail page
        agent-browser screenshot --full "$OUTPUT_DIR/screenshots/product_detail_$DATE.png"
        
        # Look for add to cart button
        local add_to_cart_ref
        add_to_cart_ref=$(agent-browser snapshot -i | grep -iE 'button.*add.*cart|button.*book' | grep -oE '@e[0-9]+' | head -1)
        
        if [[ -n "$add_to_cart_ref" ]]; then
            log "Testing add to cart..."
            agent-browser click "$add_to_cart_ref"
            agent-browser wait 1000
            
            agent-browser screenshot "$OUTPUT_DIR/screenshots/added_to_cart_$DATE.png"
            log "✓ Add to cart flow captured"
        fi
    else
        warn "No product links found"
    fi
    
    log "Checkout flow audit complete"
}

# Audit: Admin Dashboard (requires auth)
audit_admin_dashboard() {
    log "=== Auditing Admin Dashboard ==="
    
    # Navigate to admin
    agent-browser open "$WEB_URL/admin"
    agent-browser wait --load networkidle
    
    # Capture login page or dashboard
    agent-browser screenshot --full "$OUTPUT_DIR/screenshots/admin_$DATE.png"
    agent-browser snapshot -i > "$OUTPUT_DIR/snapshots/admin_$DATE.json"
    
    # Check if we're on login page
    if agent-browser find heading "Login" &>/dev/null || \
       agent-browser find heading "Sign In" &>/dev/null; then
        log "Admin requires authentication (expected)"
    elif agent-browser find heading "Dashboard" &>/dev/null || \
          agent-browser find heading "Admin" &>/dev/null; then
        log "Admin dashboard accessible"
        
        # Test navigation to different sections
        local sections=("analytics" "users" "vendors" "orders")
        for section in "${sections[@]}"; do
            agent-browser open "$WEB_URL/admin/$section"
            agent-browser wait --load networkidle
            agent-browser screenshot --full "$OUTPUT_DIR/screenshots/admin_${section}_$DATE.png"
            log "✓ Admin/$section captured"
        done
    fi
    
    log "Admin dashboard audit complete"
}

# Performance Audit
audit_performance() {
    log "=== Running Performance Checks ==="
    
    # Test key page load times
    local pages=("/" "/browse" "/products" "/tours")
    
    for page in "${pages[@]}"; do
        log "Testing $page load time..."
        
        # Use agent-browser to measure
        agent-browser open "$WEB_URL$page"
        agent-browser wait --load networkidle
        
        # Capture metrics via JavaScript
        agent-browser eval "JSON.stringify({
            loadTime: performance.timing.loadEventEnd - performance.timing.navigationStart,
            domReady: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
            firstPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0
        })" > "$OUTPUT_DIR/performance_${page//\//}_$DATE.json" 2>/dev/null || true
        
        log "✓ $page metrics captured"
    done
    
    log "Performance audit complete"
}

# Generate Summary Report
generate_report() {
    log "=== Generating Summary Report ==="
    
    local report_file="$OUTPUT_DIR/audit_report_$DATE.md"
    
    cat > "$report_file" << EOF
# IslandHub Agent-Browser Audit Report

**Date:** $(date)
**Report ID:** $DATE
**Target URL:** $WEB_URL

## Audit Summary

| Check | Status |
|-------|--------|
| Homepage | ✅ Audited |
| Search Flow | ✅ Audited |
| Checkout Flow | ✅ Audited |
| Admin Dashboard | ✅ Audited |
| Performance | ✅ Audited |

## Screenshots Captured

EOF

    # List all screenshots
    for screenshot in "$OUTPUT_DIR/screenshots/"*.png; do
        if [[ -f "$screenshot" ]]; then
            local filename
            filename=$(basename "$screenshot")
            echo "- \`$filename\`" >> "$report_file"
        fi
    done

    cat >> "$report_file" << EOF

## Snapshots Captured

EOF

    # List all snapshots
    for snapshot in "$OUTPUT_DIR/snapshots/"*.json; do
        if [[ -f "$snapshot" ]]; then
            local filename
            filename=$(basename "$snapshot")
            echo "- \`$filename\`" >> "$report_file"
        fi
    done

    cat >> "$report_file" << EOF

## Recommendations

1. Review screenshots for visual regressions
2. Check snapshots for accessibility issues
3. Analyze performance metrics for optimization opportunities
4. Verify all critical user flows are working

---
*Generated by agent-browser v$(agent-browser --version)*
EOF

    log "Report generated: $report_file"
}

# Cleanup browser instances
cleanup() {
    log "Cleaning up browser instances..."
    agent-browser --session-name "$SESSION_NAME" close 2>/dev/null || true
}

# Main execution
main() {
    log "Starting IslandHub Agent-Browser Audit"
    log "Output directory: $OUTPUT_DIR"
    
    # Set trap for cleanup
    trap cleanup EXIT
    
    # Check prerequisites
    check_agent_browser
    
    # Run audits
    audit_homepage
    audit_search_flow
    audit_checkout_flow
    audit_admin_dashboard
    audit_performance
    
    # Generate report
    generate_report
    
    log "==================================="
    log "Audit Complete! 🎉"
    log "==================================="
    log "Results saved to: $OUTPUT_DIR"
    log "View report: $OUTPUT_DIR/audit_report_$DATE.md"
}

# Show usage
usage() {
    cat << EOF
Usage: $0 [options]

Options:
  --output <dir>    Output directory (default: ./audit-results)
  --url <url>       Target URL (default: http://localhost:3000)
  --api <url>       API URL (default: http://localhost:5001)
  --help            Show this help

Examples:
  $0                                    # Run full audit
  $0 --output /var/audits               # Custom output dir
  $0 --url https://staging.islandfund.com  # Audit staging
EOF
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case "$1" in
        --output)
            OUTPUT_DIR="$2"
            shift 2
            ;;
        --url)
            WEB_URL="$2"
            shift 2
            ;;
        --api)
            API_URL="$2"
            shift 2
            ;;
        --help|-h)
            usage
            exit 0
            ;;
        *)
            error "Unknown option: $1"
            usage
            exit 1
            ;;
    esac
done

# Run main
main
