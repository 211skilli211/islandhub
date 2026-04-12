#!/bin/bash

echo "=== Docker Build Monitor for IslandFund Project ==="
echo "Monitoring for up to 3 minutes (18 checks at 10-second intervals)"
echo ""

for i in {1..18}; do
  echo ""
  echo "=== Check #$i at $(date '+%H:%M:%S') ==="
  
  # Check running containers
  echo ""
  echo "Running containers:"
  docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "islandfund|NAMES"
  
  # Check images
  echo ""
  echo "Docker images:"
  docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}" | grep -E "islandfund|REPOSITORY"
  
  # Check if containers exist and are running
  API_RUNNING=$(docker ps --format "{{.Names}}" | grep -c "islandfund_api" || echo "0")
  WEB_RUNNING=$(docker ps --format "{{.Names}}" | grep -c "islandfund_web" || echo "0")
  API_IMAGE=$(docker images --format "{{.Repository}}" | grep -c "islandfund-server" || echo "0")
  WEB_IMAGE=$(docker images --format "{{.Repository}}" | grep -c "islandfund-web" || echo "0")
  
  echo ""
  echo "Status:"
  echo "  API container running: $([ $API_RUNNING -gt 0 ] && echo 'YES' || echo 'NO')"
  echo "  Web container running: $([ $WEB_RUNNING -gt 0 ] && echo 'YES' || echo 'NO')"
  echo "  API image exists: $([ $API_IMAGE -gt 0 ] && echo 'YES' || echo 'NO')"
  echo "  Web image exists: $([ $WEB_IMAGE -gt 0 ] && echo 'YES' || echo 'NO')"
  
  # If API container is running, test the health endpoint
  if [ $API_RUNNING -gt 0 ]; then
    echo ""
    echo "Testing API health endpoint..."
    HEALTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5001/health 2>/dev/null || echo "000")
    if [ "$HEALTH_RESPONSE" = "200" ]; then
      echo "  API Health Check: SUCCESS (HTTP 200)"
      HEALTH_BODY=$(curl -s http://localhost:5001/health 2>/dev/null)
      echo "  Response: $HEALTH_BODY"
    elif [ "$HEALTH_RESPONSE" = "000" ]; then
      echo "  API Health Check: FAILED (Connection error)"
    else
      echo "  API Health Check: FAILED (HTTP $HEALTH_RESPONSE)"
    fi
  fi
  
  # Check if everything is ready
  if [ $API_RUNNING -gt 0 ] && [ $WEB_RUNNING -gt 0 ]; then
    echo ""
    echo "✓ SUCCESS: Both API and Web containers are running!"
    echo ""
    echo "=== Monitoring Complete at $(date '+%H:%M:%S') ==="
    exit 0
  fi
  
  # Wait 10 seconds before next check (unless it's the last iteration)
  if [ $i -lt 18 ]; then
    echo ""
    echo "Waiting 10 seconds before next check..."
    sleep 10
  fi
done

echo ""
echo "=== Monitoring Complete at $(date '+%H:%M:%S') ==="
echo "Note: Maximum monitoring time (3 minutes) reached."
echo "Some containers may still be building or starting."
