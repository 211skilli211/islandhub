#!/bin/bash
# =============================================================================
# IslandHub API Wrapper for ZeroClaw
# Safe, parameterized API calls to IslandHub backend
# =============================================================================

set -e

# Configuration
API_BASE="${API_URL:-http://localhost:5001}"
ADMIN_TOKEN="${ADMIN_TOKEN}"

# Logging
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >&2
}

# Show usage
usage() {
    cat << EOF
Usage: $0 <method> <endpoint> [options]

Methods: GET, POST, PUT, PATCH, DELETE

Options:
  --data '<json>'       JSON payload for POST/PUT/PATCH
  --token <token>       Override admin token
  --query '<params>'    Query string parameters

Examples:
  $0 GET /admin/stats
  $0 POST /admin/vendor-verification/123/approve --data '{"reason":"Approved"}'
  $0 GET /products --query 'q=jamaica&limit=10'
EOF
}

# Validate method
validate_method() {
    local method="$1"
    case "$method" in
        GET|POST|PUT|PATCH|DELETE) ;;
        *) log "Error: Invalid method '$method'"; exit 1 ;;
    esac
}

# Build curl command
build_curl_cmd() {
    local method="$1"
    local endpoint="$2"
    local data="$3"
    local token="$4"
    local query="$5"
    
    local url="${API_BASE}${endpoint}"
    
    # Add query parameters if provided
    if [[ -n "$query" ]]; then
        url="${url}?${query}"
    fi
    
    # Build headers
    local headers=(-H "Content-Type: application/json")
    if [[ -n "$token" ]]; then
        headers+=(-H "Authorization: Bearer $token")
    elif [[ -n "$ADMIN_TOKEN" ]]; then
        headers+=(-H "Authorization: Bearer $ADMIN_TOKEN")
    fi
    
    # Build command
    local cmd=(curl -s -w "\n%{http_code}")
    cmd+=("-X" "$method")
    cmd+=("${headers[@]}")
    
    if [[ -n "$data" && ("$method" == "POST" || "$method" == "PUT" || "$method" == "PATCH") ]]; then
        cmd+=("-d" "$data")
    fi
    
    cmd+=("$url")
    
    echo "${cmd[@]}"
}

# Main execution
main() {
    if [[ $# -lt 2 ]]; then
        usage
        exit 1
    fi
    
    local method="$1"
    local endpoint="$2"
    shift 2
    
    validate_method "$method"
    
    # Parse optional arguments
    local data=""
    local token=""
    local query=""
    
    while [[ $# -gt 0 ]]; do
        case "$1" in
            --data)
                data="$2"
                shift 2
                ;;
            --token)
                token="$2"
                shift 2
                ;;
            --query)
                query="$2"
                shift 2
                ;;
            *)
                log "Warning: Unknown option '$1'"
                shift
                ;;
        esac
    done
    
    # Build and execute command
    local curl_cmd
    curl_cmd=$(build_curl_cmd "$method" "$endpoint" "$data" "$token" "$query")
    
    log "Executing: $method $endpoint"
    
    # Execute and capture response
    local response
    response=$(eval "$curl_cmd")
    
    # Extract HTTP code and body
    local http_code
    http_code=$(echo "$response" | tail -n1)
    local body
    body=$(echo "$response" | sed '$d')
    
    # Check response code
    if [[ "$http_code" -ge 200 && "$http_code" -lt 300 ]]; then
        log "Success: HTTP $http_code"
        echo "$body"
    else
        log "Error: HTTP $http_code"
        echo "{\"error\": \"HTTP $http_code\", \"response\": $body}" >&2
        exit 1
    fi
}

main "$@"
